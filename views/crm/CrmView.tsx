
import React from 'react';
import { User, Contact, Deal, Activity, UserRole } from '../../types';
import TeamCrmView from './team/TeamCrmView';
import ManagementCrmView from './management/ManagementCrmView';
import ExecutiveCrmView from './executive/ExecutiveCrmView';

interface CrmViewProps {
  viewingUser: User;
  teamMembers: User[];
  contacts: Contact[];
  deals: Deal[];
  activities: Activity[];
  unassignedContacts: Contact[];
  allTeamContacts: Contact[];
  allTeamDeals: Deal[];
}

const CrmView: React.FC<CrmViewProps> = ({ viewingUser, teamMembers, contacts, deals, activities, unassignedContacts, allTeamContacts, allTeamDeals }) => {
  switch (viewingUser.role) {
    case UserRole.TEAM:
      return <TeamCrmView currentUser={viewingUser} contacts={contacts} deals={deals} activities={activities} />;
    case UserRole.MANAGEMENT:
      return <ManagementCrmView currentUser={viewingUser} teamMembers={teamMembers} unassignedContacts={unassignedContacts} allTeamDeals={allTeamDeals} allTeamContacts={allTeamContacts} />;
    case UserRole.EXECUTIVE:
      return <ExecutiveCrmView contacts={contacts} deals={deals} />;
    default:
      return <div className="text-red-500">Invalid user role.</div>;
  }
};

export default CrmView;
