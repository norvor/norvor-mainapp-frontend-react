
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { UserRole, User } from './types';
import { USERS, CONTACTS, DEALS, ACTIVITIES, PROJECTS, TASKS, TIME_OFF_REQUESTS, ORGANISER_ELEMENTS, TEAM_CONFIGS, TICKETS, DEPARTMENT_CONFIGS } from './data/mockData';
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


export type Module = 'hub' | 'control-center' | 'crm' | 'pm' | 'datalabs' | 'hr' | 'organiser' | 'docs' | 'requests';

export interface ActiveView {
  type: 'team' | 'department' | 'global';
  id: string; // teamId or departmentId ('hr') or 'global'
  module: Module;
  label: string; // Display name for the view, e.g., "BD Team 1 Hub"
}

const App: React.FC = () => {
  const [currentUser] = useState<User>(USERS.find(u => u.role === UserRole.EXECUTIVE)!);
  
  const [activeView, setActiveView] = useState<ActiveView>({ 
    type: 'team',
    id: 'bd1', // Default to the first team
    module: 'hub',
    label: `${TEAM_CONFIGS[0].name} Hub`,
  });
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [perspectives, setPerspectives] = useState<{[key in string]?: UserRole}>({});

  const handleResize = useCallback(() => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(true);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check on load
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };
  
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
    return USERS.filter(u => u.teamIds?.includes(activeView.id));
  }, [activeView]);

  const unassignedContacts = useMemo(() => CONTACTS.filter(c => !c.ownerId), []);
  
  const allTeamContacts = useMemo(() => {
      const memberIds = activeTeamMembers.map(tm => tm.id);
      return CONTACTS.filter(c => c.ownerId && memberIds.includes(c.ownerId));
  }, [activeTeamMembers]);

  const allTeamDeals = useMemo(() => {
      const memberIds = activeTeamMembers.map(tm => tm.id);
      return DEALS.filter(d => d.ownerId && memberIds.includes(d.ownerId));
  }, [activeTeamMembers]);

  const teamTickets = useMemo(() => {
    if (activeView.type !== 'team') return [];
    return TICKETS.filter(t => t.teamId === activeView.id);
  }, [activeView.id, activeView.type]);

  const handleNavigate = (newView: ActiveView) => {
    setActiveView(newView);
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }

  const renderContent = () => {
    const viewingAsRole = perspectives[activeView.module] || currentUser.role;

    const getContextualUser = (role: UserRole): User => {
        if (role === currentUser.role) return currentUser;

        const userPool = activeView.type === 'team' ? activeTeamMembers : USERS;
        
        const userInPool = userPool.find(m => m.role === role);
        if (userInPool) return userInPool;
        
        const fallbackUser = USERS.find(u => u.role === role);
        return fallbackUser || currentUser;
    }
    
    const contextualUser = getContextualUser(viewingAsRole);

    switch (activeView.module) {
      case 'hub':
        return <TeamHubView teamId={activeView.id} />;
      case 'crm':
        return <CrmView 
          viewingUser={contextualUser}
          teamMembers={activeTeamMembers}
          contacts={CONTACTS}
          deals={DEALS}
          activities={ACTIVITIES}
          unassignedContacts={unassignedContacts}
          allTeamContacts={allTeamContacts}
          allTeamDeals={allTeamDeals}
        />;
      case 'pm':
        return <PmView
          viewingUser={contextualUser}
          allUsers={USERS}
          projects={PROJECTS}
          tasks={TASKS}
          teamMembers={activeTeamMembers}
        />;
      case 'hr':
        const directReports = USERS.filter(u => u.managerId === contextualUser.id);
        return <HrView
            viewingUser={contextualUser}
            allUsers={USERS}
            timeOffRequests={TIME_OFF_REQUESTS}
            directReports={directReports}
        />;
      case 'organiser':
        return <OrganiserView 
          initialElements={ORGANISER_ELEMENTS}
          currentUser={currentUser}
        />;
      case 'datalabs':
        return <DataLabsView />;
      case 'docs':
        return <DocsView />;
      case 'requests':
        return <RequestsView teamId={activeView.id} tickets={teamTickets} allUsers={USERS} currentUser={currentUser} />;
      default:
        return <div>Select a view</div>;
    }
  }

  return (
    <div className="relative flex h-screen bg-gray-100 text-gray-800">
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
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6 lg:p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;