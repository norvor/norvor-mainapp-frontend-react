import React from 'react';
import { useLocation } from 'react-router-dom';
import { User, UserRole } from '../../types';
import TeamCrmView from './team/TeamCrmView';
import ManagementCrmView from './management/ManagementCrmView';
import ExecutiveCrmView from './executive/ExecutiveCrmView';
import ToolDashboardView from '../tools/ToolDashboardView';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

interface CrmViewProps {
  viewingUser: User;
  teamMembers: User[];
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
        currentUser={props.viewingUser}
      />
    );
  }
  
  const { 
    viewingUser, 
    teamMembers, 
  } = props;

  switch (viewingUser.role) {
    case UserRole.TEAM:
      return <TeamCrmView 
                currentUser={viewingUser}
                teamMembers={teamMembers}
             />;
    case UserRole.MANAGEMENT:
      return <ManagementCrmView 
                currentUser={viewingUser} 
                teamMembers={teamMembers} 
             />;
    case UserRole.EXECUTIVE:
      return <ExecutiveCrmView />;
    default:
      return <div className="text-red-500">Invalid user role.</div>;
  }
};

export default CrmView;