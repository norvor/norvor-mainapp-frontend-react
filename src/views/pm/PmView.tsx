
import React from 'react';
import { User, UserRole, Project, Task } from '../../types';
import TeamPmView from './team/TeamPmView';
import ManagementPmView from './management/ManagementPmView';
import ExecutivePmView from './executive/ExecutivePmView';

interface PmViewProps {
  viewingUser: User;
  allUsers: User[];
  projects: Project[];
  tasks: Task[];
  teamMembers: User[];
}

const PmView: React.FC<PmViewProps> = (props) => {
  switch (props.viewingUser.role) {
    case UserRole.TEAM:
      return <TeamPmView 
                currentUser={props.viewingUser}
                projects={props.projects}
                tasks={props.tasks}
                allUsers={props.allUsers}
             />;
    case UserRole.MANAGEMENT:
        const managedProjects = props.projects.filter(p => 
            props.teamMembers.some(tm => tm.id === p.managerId) || p.managerId === props.viewingUser.id
        );
      return <ManagementPmView 
                currentUser={props.viewingUser}
                projects={managedProjects}
                tasks={props.tasks}
                teamMembers={props.teamMembers}
             />;
    case UserRole.EXECUTIVE:
      return <ExecutivePmView
                allUsers={props.allUsers}
                projects={props.projects}
                tasks={props.tasks}
             />;
    default:
      return <div className="text-red-500">Invalid user role.</div>;
  }
};

export default PmView;