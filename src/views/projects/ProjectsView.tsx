import React from 'react';
import { useLocation } from 'react-router-dom';
import { User, UserRole, Project, Task } from '../../types';
import TeamProjectsView from './team/TeamProjectsView';
import ManagementProjectsView from './management/ManagementProjectsView';
import ExecutiveProjectsView from './executive/ExecutiveProjectsView';
import ToolDashboardView from '../tools/ToolDashboardView';

interface ProjectsViewProps {
  viewingUser: User;
  allUsers: User[];
  projects: Project[];
  tasks: Task[];
  teamMembers: User[];
}

const ProjectsView: React.FC<ProjectsViewProps> = (props) => {
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const forcedView = urlParams.get('view');

  // If no view is specified in the URL, render the Tool Dashboard by default.
  if (!forcedView) {
    return (
      <ToolDashboardView
        toolId="pm"
        projects={props.projects}
        tasks={props.tasks}
        users={props.allUsers}
        currentUser={props.viewingUser}
      />
    );
  }

  // If a view is specified, render the corresponding role-based component.
  switch (props.viewingUser.role) {
    case UserRole.TEAM:
      return <TeamProjectsView 
                currentUser={props.viewingUser}
                projects={props.projects}
                tasks={props.tasks}
                allUsers={props.allUsers}
             />;
    case UserRole.MANAGEMENT:
        const managedProjects = props.projects.filter(p => 
            props.teamMembers.some(tm => tm.id === p.managerId) || p.managerId === props.viewingUser.id
        );
      return <ManagementProjectsView 
                currentUser={props.viewingUser}
                projects={managedProjects}
                tasks={props.tasks}
                teamMembers={props.teamMembers}
             />;
    case UserRole.EXECUTIVE:
      return <ExecutiveProjectsView
                allUsers={props.allUsers}
                projects={props.projects}
                tasks={props.tasks}
             />;
    default:
      return <div className="text-red-500">Invalid user role.</div>;
  }
};

export default ProjectsView;