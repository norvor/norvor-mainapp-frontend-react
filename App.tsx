

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { UserRole, User } from './types';
import { USERS, CONTACTS, DEALS, ACTIVITIES, PROJECTS, TASKS, TIME_OFF_REQUESTS, ORGANISER_ELEMENTS, ORGANISER_CONNECTIONS } from './data/mockData';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import CrmView from './views/crm/CrmView';
import PmView from './views/pm/PmView';
import HrView from './views/hr/HrView';
import OrganiserView from './views/organiser/OrganiserView';
import DashboardView from './views/dashboard/DashboardView';
import DataLabsView from './views/datalabs/DataLabsView';
import TeamDashboardView from './views/team/TeamDashboardView';
import DocsView from './views/docs/DocsView';

export type Module = 'control-center' | 'crm' | 'pm' | 'datalabs' | 'team-dashboard' | 'hr' | 'organiser' | 'docs';

export interface ActiveView {
  module: Module;
  role: UserRole;
  teamId?: string;
  label: string;
}

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User>(USERS.find(u => u.role === UserRole.EXECUTIVE)!);
  
  const [activeView, setActiveView] = useState<ActiveView>({ 
    module: 'control-center', 
    role: UserRole.EXECUTIVE,
    label: 'Control Center'
  });
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);

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

  const viewingUser = useMemo(() => {
    return USERS.find(u => u.role === activeView.role) || USERS[0];
  }, [activeView.role]);

  const teamMembers = useMemo(() => {
    if (viewingUser.role === UserRole.EXECUTIVE) return USERS.filter(u => u.role === UserRole.TEAM);
    if (viewingUser.role === UserRole.MANAGEMENT) return USERS.filter(u => u.role === UserRole.TEAM && u.managerId === viewingUser.id);
    return [];
  }, [viewingUser]);
  
  const directReports = useMemo(() => {
    if (viewingUser.role === UserRole.MANAGEMENT) {
        return USERS.filter(u => u.managerId === viewingUser.id);
    }
    return [];
  }, [viewingUser]);

  const unassignedContacts = useMemo(() => CONTACTS.filter(c => !c.ownerId), []);
  
  const allTeamContacts = useMemo(() => {
      const memberIds = teamMembers.map(tm => tm.id);
      return CONTACTS.filter(c => c.ownerId && memberIds.includes(c.ownerId));
  }, [teamMembers]);

  const allTeamDeals = useMemo(() => {
      const memberIds = teamMembers.map(tm => tm.id);
      return DEALS.filter(d => d.ownerId && memberIds.includes(d.ownerId));
  }, [teamMembers]);

  const handleNavigate = (newView: ActiveView) => {
    setActiveView(newView);
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }

  const renderContent = () => {
    switch (activeView.module) {
      case 'control-center':
        return <DashboardView role={activeView.role} />;
      case 'crm':
        return <CrmView 
          viewingUser={viewingUser}
          teamMembers={teamMembers}
          contacts={CONTACTS}
          deals={DEALS}
          activities={ACTIVITIES}
          unassignedContacts={unassignedContacts}
          allTeamContacts={allTeamContacts}
          allTeamDeals={allTeamDeals}
        />;
      case 'pm':
        return <PmView
          viewingUser={viewingUser}
          allUsers={USERS}
          projects={PROJECTS}
          tasks={TASKS}
          teamMembers={teamMembers}
        />;
      case 'hr':
        return <HrView
            viewingUser={viewingUser}
            allUsers={USERS}
            timeOffRequests={TIME_OFF_REQUESTS}
            directReports={directReports}
        />;
      case 'organiser':
        return <OrganiserView 
          initialElements={ORGANISER_ELEMENTS}
          initialConnections={ORGANISER_CONNECTIONS}
        />;
      case 'datalabs':
        return <DataLabsView />;
      case 'docs':
        return <DocsView />;
      case 'team-dashboard':
        return <TeamDashboardView teamId={activeView.teamId} teamName={activeView.label}/>
      default:
        return <div>Select a view</div>;
    }
  }


  return (
    <div className="flex h-screen bg-gray-100 text-gray-800">
      <Sidebar 
        currentUser={currentUser}
        activeView={activeView}
        onNavigate={handleNavigate}
        isOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
      />

      {/* Mobile-only backdrop */}
      {isSidebarOpen && (
        <div 
          onClick={toggleSidebar}
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
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