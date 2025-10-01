import React from 'react';
import { useLocation } from 'react-router-dom';
import { User, Contact, Deal, Activity, UserRole } from '../../types';
import TeamCrmView from './team/TeamCrmView';
import ManagementCrmView from './management/ManagementCrmView';
import ExecutiveCrmView from './executive/ExecutiveCrmView';
import ToolDashboardView from '../tools/ToolDashboardView';

interface CrmViewProps {
  viewingUser: User;
  teamMembers: User[];
  allUsers: User[]; 
  contacts: Contact[];
  deals: Deal[];
  activities: Activity[];
  unassignedContacts: Contact[];
  allTeamContacts: Contact[];
  allTeamDeals: Deal[];
  refetchData: () => void;
}

const CrmView: React.FC<CrmViewProps> = (props) => {
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const forcedView = urlParams.get('view');

  if (!forcedView) {
    return (
      <ToolDashboardView
        toolId="crm"
        projects={[]}
        tasks={[]}
        users={props.allUsers}
        currentUser={props.viewingUser}
      />
    );
  }
  
  const { 
    viewingUser, 
    teamMembers, 
    allUsers, 
    contacts, 
    deals, 
    activities, 
    unassignedContacts, 
    allTeamContacts, 
    allTeamDeals, 
    refetchData 
  } = props;

  switch (viewingUser.role) {
    case UserRole.TEAM:
      return <TeamCrmView 
                currentUser={viewingUser}
                teamMembers={teamMembers}
                allUsers={allUsers} 
                allContacts={contacts}
                allDeals={deals}
                activities={activities} 
                refetchContacts={refetchData}
             />;
    case UserRole.MANAGEMENT:
      return <ManagementCrmView 
                currentUser={viewingUser} 
                teamMembers={teamMembers} 
                unassignedContacts={unassignedContacts} 
                allTeamDeals={allTeamDeals} 
                allTeamContacts={allTeamContacts} 
             />;
    case UserRole.EXECUTIVE:
      return <ExecutiveCrmView 
                contacts={contacts} 
                deals={deals} 
             />;
    default:
      return <div className="text-red-500">Invalid user role.</div>;
  }
};

export default CrmView;