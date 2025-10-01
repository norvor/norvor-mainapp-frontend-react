import React from 'react';
import { useLocation } from 'react-router-dom';
import { User, UserRole } from '../../types';
import TeamProjectsView from './team/TeamProjectsView';
import ManagementProjectsView from './management/ManagementProjectsView';
import ExecutiveProjectsView from './executive/ExecutiveProjectsView';
import ToolDashboardView from '../tools/ToolDashboardView';

interface ProjectsViewProps {
  viewingUser: User;
  teamMembers: User[];
}

const ProjectsView: React.FC<ProjectsViewProps> = ({ viewingUser, teamMembers }) => {
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const forcedView = urlParams.get('view');

  // If no view is specified in the URL, render the Tool Dashboard by default.
  if (!forcedView) {
    return (
      <ToolDashboardView
        toolId="pm"
        currentUser={viewingUser}
      />
    );
  }

  // If a view is specified, render the corresponding role-based component.
  switch (viewingUser.role) {
    case UserRole.TEAM:
      return <TeamProjectsView 
                currentUser={viewingUser}
             />;
    case UserRole.MANAGEMENT:
      return <ManagementProjectsView 
                teamMembers={teamMembers}
             />;
    case UserRole.EXECUTIVE:
      return <ExecutiveProjectsView />;
    default:
      return <div className="text-red-500">Invalid user role.</div>;
  }
};

export default ProjectsView;