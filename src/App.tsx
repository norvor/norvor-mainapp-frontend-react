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
import { RootState, AppDispatch } from './store/store';
import { fetchUsers, fetchCurrentUser } from './store/slices/userSlice';
import { fetchContacts } from './store/slices/contactSlice';
import { fetchDeals } from './store/slices/dealSlice';
import { fetchProjects } from './store/slices/projectSlice';
import { fetchTasks } from './store/slices/taskSlice';


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
  
  // Combine loading and error states from all slices
  const isLoading = usersLoading || contactsLoading || dealsLoading || projectsLoading || tasksLoading;
  const error = usersError || contactsError || dealsError || projectsError || tasksError;


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
    const token = localStorage.getItem('authToken');
    if (!token) {
      window.location.href = 'https://www.norvorx.com/login';
      return;
    }
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    if (tokenFromUrl) {
      localStorage.setItem('authToken', tokenFromUrl);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Dispatch all fetch actions to populate the store
    dispatch(fetchCurrentUser());
    dispatch(fetchUsers());
    dispatch(fetchContacts());
    dispatch(fetchDeals());
    dispatch(fetchProjects());
    dispatch(fetchTasks());
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
  }

  // --- MEMOIZED DATA DERIVATIONS (No changes here, they just work with Redux state now) ---
  const activeTeamMembers = useMemo(() => {
    if (activeView.type !== 'team') return [];
    return users.filter(u => Array.isArray(u.teamIds) && u.teamIds.includes(activeView.id));
  }, [activeView, users]);

  const unassignedContacts = useMemo(() => contacts.filter(c => !c.ownerId), [contacts]);

  const allTeamContacts = useMemo(() => {
    const memberIds = activeTeamMembers.map(tm => tm.id);
    return contacts.filter(c => c.ownerId && memberIds.includes(c.ownerId));
  }, [activeTeamMembers, contacts]);

  const allTeamDeals = useMemo(() => {
    const memberIds = activeTeamMembers.map(tm => tm.id);
    return deals.filter(d => d.ownerId && memberIds.includes(d.ownerId));
  }, [activeTeamMembers, deals]);

  // Mock data to be replaced later
  const activities: Activity[] = [];
  const timeOffRequests: TimeOffRequest[] = [];
  const organiserElements: OrganiserElement[] = [];
  const teamTickets: Ticket[] = [];


  // --- RENDER LOGIC ---
  if (isLoading || !currentUser) {
    return <div className="p-8 bg-gray-100 dark:bg-slate-900 text-gray-800 dark:text-gray-200 h-screen flex items-center justify-center">Loading Application...</div>;
  }
  if (error) {
    return <div className="p-8 bg-gray-100 dark:bg-slate-900 text-red-500 h-screen flex items-center justify-center">Error: {error}</div>;
  }

  const renderContent = () => {
    const viewingAsRole = perspectives[activeView.module] || currentUser.role;

    const getContextualUser = (role: UserRole): User => {
      if (role === currentUser.role) return currentUser;
      const userPool = activeView.type === 'team' ? activeTeamMembers : users;
      const userInPool = userPool.find(m => m.role === role);
      if (userInPool) return userInPool;
      const fallbackUser = users.find(u => u.role === role);
      return fallbackUser || currentUser;
    }

    const contextualUser = getContextualUser(viewingAsRole);

    switch (activeView.module) {
      case 'hub':
        return <TeamHubView teamId={activeView.id} />;
      case 'dashboard':
        return <DashboardView />;
      case 'social':
        return <SocialView />;
      case 'crm':
        return <CrmView
          viewingUser={contextualUser}
          teamMembers={activeTeamMembers}
          contacts={contacts}
          deals={deals}
          activities={activities}
          unassignedContacts={unassignedContacts}
          allTeamContacts={allTeamContacts}
          allTeamDeals={allTeamDeals}
          refetchData={() => dispatch(fetchContacts())} // refetchData now dispatches Redux action
        />;
      case 'pm':
        return <PmView
          viewingUser={contextualUser}
          allUsers={users}
          projects={projects}
          tasks={tasks}
          teamMembers={activeTeamMembers}
        />;
      // ... other cases will be updated later, they will need mock data for now
      default:
        return <div>Select a view</div>;
    }
  }

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
