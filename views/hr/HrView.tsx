
import React from 'react';
import { User, UserRole, TimeOffRequest } from '../../types';
import TeamHrView from './team/TeamHrView';
import ManagementHrView from './management/ManagementHrView';
import ExecutiveHrView from './executive/ExecutiveHrView';

interface HrViewProps {
  viewingUser: User;
  allUsers: User[];
  timeOffRequests: TimeOffRequest[];
  directReports: User[];
}

const HrView: React.FC<HrViewProps> = (props) => {
  switch (props.viewingUser.role) {
    case UserRole.TEAM:
      return <TeamHrView 
                currentUser={props.viewingUser}
                allUsers={props.allUsers}
                timeOffRequests={props.timeOffRequests}
             />;
    case UserRole.MANAGEMENT:
      const teamTimeOffRequests = props.timeOffRequests.filter(r => 
          props.directReports.some(dr => dr.id === r.userId)
      );
      return <ManagementHrView 
                currentUser={props.viewingUser}
                directReports={props.directReports}
                timeOffRequests={teamTimeOffRequests}
             />;
    case UserRole.EXECUTIVE:
      return <ExecutiveHrView
                allUsers={props.allUsers}
                timeOffRequests={props.timeOffRequests}
             />;
    default:
      return <div className="text-red-500">Invalid user role.</div>;
  }
};

export default HrView;
