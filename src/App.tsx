import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { UserRole, User, Activity, TimeOffRequest, OrganiserElement, Ticket } from './types';
import { TEAM_CONFIGS, DEPARTMENT_CONFIGS, CENTRAL_CONFIGS } from './data/mockData';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import CrmView from './views/crm/CrmView';
import PmView from './views/pm/PmView';
import HrView from './views/hr/HrView';
import OrganiserView from './views/organiser/OrganiserView';
import DataLabsView from './views/datalabs/DataLabsView';
import TeamHubView from './views/teamhub/TeamHubView';
import DocsView from './views/docs/DocsView';
import RequestsView from './views/requests/RequestsView';
import { ThemeProvider } from './contexts/ThemeContext';
import DashboardView from './views/dashboard/DashboardView';
import SocialView from './views/social/SocialView';

// --- Redux Imports ---
import { fetchDocs } from './store/slices/docSlice';
import { fetchOrganiserElements } from './store/slices/organiserSlice';
import { fetchTickets } from './store/slices/ticketSlice';
import { RootState, AppDispatch } from './store/store';
import { fetchActivities } from './store/slices/activitySlice';
import { fetchUsers, fetchCurrentUser } from './store/slices/userSlice';
import { fetchContacts } from './store/slices/contactSlice';
import { fetchDeals } from './store/slices/dealSlice';
import { fetchProjects } from './store/slices/projectSlice';
import { fetchTasks } from './store/slices/taskSlice';
import { fetchTimeOffRequests } from './store/slices/timeOffRequestSlice';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export type Module = 'hub' | 'control-center' | 'crm' | 'pm' | 'datalabs' | 'hr' | 'organiser' | 'docs' | 'requests' | 'dashboard' | 'social';

export interface ActiveView {
  type: 'team' | 'department' | 'global';
  id: string;
  module: Module;
  label: string;
}

const App: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();

  // --- SELECTING ALL DATA FROM THE REDUX STORE ---
  const { currentUser, users, loading: usersLoading, error: usersError } = useSelector((state: RootState) => state.users);
  const { contacts, loading: contactsLoading, error: contactsError } = useSelector((state: RootState) => state.contacts);
  const { deals, loading: dealsLoading, error: dealsError } = useSelector((state: RootState) => state.deals);
  const { projects, loading: projectsLoading, error: projectsError } = useSelector((state: RootState) => state.projects);
  const { tasks, loading: tasksLoading, error: tasksError } = useSelector((state: RootState) => state.tasks);
  const { activities, loading: activitiesLoading, error: activitiesError } = useSelector((state: RootState) => state.activities);
  const { timeOffRequests, loading: timeOffRequestsLoading, error: timeOffRequestsError } = useSelector((state: RootState) => state.timeOffRequests); 
  const { organiserElements, loading: organiserElementsLoading, error: organiserElementsError } = useSelector((state: RootState) => state.organiserElements); 
  const { tickets, loading: ticketsLoading, error: ticketsError } = useSelector((state: RootState) => state.tickets);
  const { docs, loading: docsLoading, error: docsError } = useSelector((state: RootState) => (state.docs as any)); // <-- ADDED

  // Combine loading and error states from all slices
  const isLoading = usersLoading || contactsLoading || dealsLoading || projectsLoading || tasksLoading 
    || activitiesLoading || timeOffRequestsLoading || organiserElementsLoading || ticketsLoading 
    // --- New Loading State ---
    || docsLoading; // <-- ADDED
    
  const error = usersError || contactsError || dealsError || projectsError || tasksError 
    || activitiesError || timeOffRequestsError || organiserElementsError || ticketsError 
    // --- New Error State ---
    || docsError; // <-- ADDED
  // Combine loading and error states from all slices
  
  // --- LOCAL UI STATE ---
  const [activeView, setActiveView] = useState<ActiveView>({
    type: 'team',
    id: 'bd1',
    module: 'hub',
    label: `${TEAM_CONFIGS[0].name} Hub`,
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [perspectives, setPerspectives] = useState<{ [key in string]?: UserRole }>({});

  // --- DISPATCHING FETCH ACTIONS ON APP LOAD ---
  useEffect(() => {
    let currentToken = localStorage.getItem('authToken');
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    if (tokenFromUrl) {
      localStorage.setItem('authToken', tokenFromUrl);
      currentToken = tokenFromUrl;
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    console.log("Auth Token:", currentToken);
    if (!currentToken) {
      //window.location.href = 'http://localhost:3000/login';
      window.location.href = 'https://www.norvorx.com/login';
      return;
    }
    dispatch(fetchCurrentUser());
    dispatch(fetchUsers());
    dispatch(fetchContacts());
    dispatch(fetchDeals());
    dispatch(fetchProjects());
    dispatch(fetchTasks());
    dispatch(fetchActivities());
    dispatch(fetchTimeOffRequests());
    dispatch(fetchOrganiserElements());
    dispatch(fetchTickets());
    dispatch(fetchDocs());
  }, [dispatch]);

  const handleResize = useCallback(() => {
    setIsSidebarOpen(window.innerWidth >= 1024);
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

  const handlePerspectiveChange = (module: Module, role: UserRole) => {
    setPerspectives(prev => ({ ...prev, [module]: role }));
    if (activeView.module !== module) {
      const teamConfig = TEAM_CONFIGS.find(t => t.id === activeView.id);
      const deptConfig = DEPARTMENT_CONFIGS.find(d => d.id === activeView.id);
      const name = teamConfig?.name || deptConfig?.name || 'HR';
      const moduleLabel = module.charAt(0).toUpperCase() + module.slice(1);
      handleNavigate({ ...activeView, module, label: `${name} ${moduleLabel}` });
    }
  };

  const handleNavigate = (newView: ActiveView) => {
    setActiveView(newView);
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  // --- MEMOIZED DATA DERIVATIONS ---
  const activeTeamMembers = useMemo(() => {
    if (activeView.type !== 'team') return [];
    if (!Array.isArray(users)) return [];
    return users.filter(u => u.teamIds && Array.isArray(u.teamIds) && u.teamIds.includes(activeView.id));
  }, [activeView, users]);

  const unassignedContacts = useMemo(() => {
    if (!Array.isArray(contacts)) return [];
    return contacts.filter(c => !c.ownerId);
  }, [contacts]);

  const allTeamContacts = useMemo(() => {
    if (!Array.isArray(contacts)) return [];
    const memberIds = activeTeamMembers.map(tm => tm.id);
    return contacts.filter(c => c.ownerId && memberIds.includes(c.ownerId));
  }, [activeTeamMembers, contacts]);

  const allTeamDeals = useMemo(() => {
    if (!Array.isArray(deals)) return [];
    const memberIds = activeTeamMembers.map(tm => tm.id);
    return deals.filter(d => d.ownerId && memberIds.includes(d.ownerId));
  }, [activeTeamMembers, deals]);

  const activeTeamProjects = useMemo(() => {
    if (!Array.isArray(projects)) return [];
    const memberIds = activeTeamMembers.map(tm => tm.id);
    return projects.filter(
      p => Array.isArray(p.memberIds) && p.memberIds.some(memberId => memberIds.includes(memberId))
    );
  }, [projects, activeTeamMembers]);

  const activeTeamTickets = useMemo(() => {
    if (!Array.isArray(tickets)) return [];
    if (activeView.type !== 'team') return [];
    return tickets.filter(t => t.teamId === activeView.id);
  }, [activeView, tickets]);

  const allActivities = activities;

  // --- RENDER LOGIC ---
  if (isLoading || !currentUser) {
    return <div className="p-8 bg-gray-100 dark:bg-slate-900 text-gray-800 dark:text-gray-200 h-screen flex items-center justify-center">Loading Application...</div>;
  }
  if (error) {
    return <div className="p-8 bg-gray-100 dark:bg-slate-900 text-red-500 h-screen flex items-center justify-center">Error: {error}</div>;
  }

  // --- RENDER CONTENT FUNCTION ---
  const viewingAsRole = perspectives[activeView.module] || currentUser.role;

  const getContextualUser = (role: UserRole): User => {
    if (role === currentUser.role) return currentUser;
    const userPool = activeView.type === 'team' ? activeTeamMembers : users;
    const userInPool = userPool.find(m => m.role === role);
    if (userInPool) return userInPool;
    const fallbackUser = users.find(u => u.role === role);
    return fallbackUser || currentUser;
  };

  const contextualUser = getContextualUser(viewingAsRole);

  const renderContent = () => {
    switch (activeView.module) {
      case 'hub':
        return <TeamHubView teamId={activeView.id} tickets={activeTeamTickets} teamMembers={activeTeamMembers} projects={activeTeamProjects}/>;
      case 'dashboard':
        return <DashboardView />;
      case 'social':
        return <SocialView />;
      case 'requests':
        return <RequestsView
          teamId={activeView.id}
          tickets={activeTeamTickets}
          allUsers={users}
          currentUser={currentUser}
        />;
      case 'docs': // --- Update Docs Case ---
        return <DocsView
          currentUser={contextualUser}
          initialDocs={docs as any} // Pass the fetched documents
        />;
      case 'crm':
        return <CrmView
          viewingUser={contextualUser}
          teamMembers={activeTeamMembers}
          contacts={contacts}
          deals={deals}
          activities={allActivities}
          unassignedContacts={unassignedContacts}
          allTeamContacts={allTeamContacts}
          allTeamDeals={allTeamDeals}
          refetchData={() => dispatch(fetchContacts())}
        />;
      case 'pm':
        return <PmView
          viewingUser={contextualUser}
          allUsers={users}
          projects={projects}
          tasks={tasks}
          teamMembers={activeTeamMembers}
        />;
      case 'hr':
        return <HrView
          viewingUser={contextualUser}
          allUsers={users}
          timeOffRequests={timeOffRequests}
          directReports={users.filter(u => u.managerId === contextualUser.id)}
        />;
      case 'organiser':
        return <OrganiserView
          currentUser={contextualUser}
          initialElements={organiserElements}
        />;
      default:
        return <div>Select a view</div>;
    }
  };

  return (
    <ThemeProvider>
      <div className="relative flex h-screen bg-gray-100 dark:bg-slate-900 text-gray-800 dark:text-gray-200">
        <Sidebar
          currentUser={currentUser}
          activeView={activeView}
          onNavigate={handleNavigate}
          isOpen={isSidebarOpen}
          onToggleSidebar={toggleSidebar}
          perspectives={perspectives}
          onPerspectiveChange={handlePerspectiveChange}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header user={currentUser} onToggleSidebar={toggleSidebar} />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-slate-900 p-6 lg:p-8">
            {renderContent()}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default App;