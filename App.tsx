import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { UserRole, User, Contact, Deal, Activity, Project, Task, TimeOffRequest, OrganiserElement, Ticket } from './types';
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
import apiClient from './utils/apiClient';

export type Module = 'hub' | 'control-center' | 'crm' | 'pm' | 'datalabs' | 'hr' | 'organiser' | 'docs' | 'requests' | 'dashboard' | 'social';

export interface ActiveView {
  type: 'team' | 'department' | 'global';
  id: string;
  module: Module;
  label: string;
}

const App: React.FC = () => {
  // --- STATE FOR LIVE DATA ---
  const [users, setUsers] = useState<User[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null); // Start with no user
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [activeView, setActiveView] = useState<ActiveView>({ 
    type: 'team',
    id: 'bd1',
    module: 'hub',
    label: `${TEAM_CONFIGS[0].name} Hub`,
  });
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [perspectives, setPerspectives] = useState<{[key in string]?: UserRole}>({});

  // --- DATA FETCHING LOGIC ---
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // In a real app, you would have a /users/me endpoint to get the current user
        // For now, we fetch all users and set an executive as the current user
        const usersData = await apiClient('/users/');
        const contactsData = await apiClient('/crm/contacts/');
        const dealsData = await apiClient('/crm/deals/');
        
        setUsers(usersData);
        setContacts(contactsData);
        setDeals(dealsData);

        // Find and set the current user AFTER data is fetched
        const executiveUser = usersData.find((u: User) => u.role === UserRole.EXECUTIVE);
        setCurrentUser(executiveUser || usersData[0] || null);

      } catch (err: any) {
        setError(err.message || "Failed to fetch data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const handleResize = useCallback(() => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(true);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
  
  const handlePerspectiveChange = (module: Module, role: UserRole) => {
      setPerspectives(prev => ({...prev, [module]: role}));
      if (activeView.module !== module) {
          const teamConfig = TEAM_CONFIGS.find(t => t.id === activeView.id);
          const deptConfig = DEPARTMENT_CONFIGS.find(d => d.id === activeView.id);
          const name = teamConfig?.name || deptConfig?.name || 'HR';
          const moduleLabel = module.charAt(0).toUpperCase() + module.slice(1);
          handleNavigate({ ...activeView, module, label: `${name} ${moduleLabel}` });
      }
  };

  const activeTeamMembers = useMemo(() => {
    if (activeView.type !== 'team') return [];
    // Fix: Ensure teamIds is treated as an array from JSON
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

  // These are still using mock data and will be connected later
  const teamTickets = [] as Ticket[]; 
  const timeOffRequests = [] as TimeOffRequest[];
  const organiserElements = [] as OrganiserElement[];
  const projects = [] as Project[];
  const tasks = [] as Task[];
  const activities = [] as Activity[];

  const handleNavigate = (newView: ActiveView) => {
    setActiveView(newView);
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }

  // --- RENDER LOGIC ---
  // Don't try to render anything until we have a current user
  if (isLoading || !currentUser) {
    return <div className="p-8 bg-gray-100 dark:bg-slate-900 text-gray-800 dark:text-gray-200 h-screen">Loading Application...</div>;
  }
  if (error) {
    return <div className="p-8 bg-gray-100 dark:bg-slate-900 text-red-500 h-screen">Error: {error}</div>;
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
        />;
      // ... other cases will be updated later
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

        {isSidebarOpen && window.innerWidth < 1024 && (
          <div 
            onClick={toggleSidebar}
            className="absolute inset-0 z-30 bg-gray-900/60 lg:hidden"
            aria-hidden="true"
          ></div>
        )}

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