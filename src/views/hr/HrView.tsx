import React from 'react';
import { useLocation } from 'react-router-dom';
import { User, UserRole } from '../../types';
import TeamHrView from './team/TeamHrView';
import ManagementHrView from './management/ManagementHrView';
import ExecutiveHrView from './executive/ExecutiveHrView';
import ToolDashboardView from '../tools/ToolDashboardView';

interface HrViewProps {
  viewingUser: User;
  directReports: User[];
}

const HrView: React.FC<HrViewProps> = ({ viewingUser, directReports }) => {
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const forcedView = urlParams.get('view');

  if (!forcedView) {
    return (
      <ToolDashboardView
        toolId="hr"
        currentUser={viewingUser}
      />
    );
  }

  switch (viewingUser.role) {
    case UserRole.TEAM:
      return <TeamHrView 
                currentUser={viewingUser}
             />;
    case UserRole.MANAGEMENT:
      return <ManagementHrView 
                directReports={directReports}
             />;
    case UserRole.EXECUTIVE:
      return <ExecutiveHrView />;
    default:
      return <div className="text-red-500">Invalid user role.</div>;
  }
};

export default HrView;