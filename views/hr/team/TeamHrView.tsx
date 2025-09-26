
import React, { useState, useMemo } from 'react';
import { User, TimeOffRequest, RequestStatus, LeaveType } from '../../../types';

// Sub-components
const MyProfileView: React.FC<{ user: User }> = ({ user }) => (
    <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800">My Profile</h3>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div><strong>Name:</strong> {user.name}</div>
            <div><strong>Title:</strong> {user.title}</div>
            <div><strong>Department:</strong> {user.department}</div>
            <div><strong>Email:</strong> {user.email}</div>
            <div><strong>Phone:</strong> {user.phone}</div>
            <div><strong>Address:</strong> {user.address}</div>
            <div><strong>Emergency Contact:</strong> {user.emergencyContact}</div>
        </div>
        <button className="mt-6 px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-md hover:bg-violet-700">Edit Profile</button>
    </div>
);

const TimeOffView: React.FC<{ user: User, requests: TimeOffRequest[] }> = ({ user, requests }) => (
    <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Time-Off</h3>
            <button className="px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-md hover:bg-violet-700">Request Time Off</button>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4 text-center">
            {Object.entries(user.leaveBalance || {}).map(([type, balance]) => (
                <div key={type} className="bg-gray-100 p-3 rounded-md">
                    <p className="text-gray-500 text-sm">{type}</p>
                    <p className="font-bold text-xl">{balance} days</p>
                </div>
            ))}
        </div>
        <h4 className="font-semibold text-gray-700 mt-6">My Requests</h4>
        <div className="overflow-x-auto mt-2">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50"><tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr></thead>
                <tbody>
                {requests.map(r => (
                    <tr key={r.id}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">{r.type}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">{r.startDate} to {r.endDate}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">{r.status}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    </div>
);

const CompanyDirectory: React.FC<{ users: User[] }> = ({ users }) => (
    <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Company Directory</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map(user => (
                <div key={user.id} className="p-4 border rounded-lg">
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.title}</p>
                    <p className="text-sm text-gray-500">{user.department}</p>
                    <a href={`mailto:${user.email}`} className="text-sm text-violet-600 hover:underline">{user.email}</a>
                </div>
            ))}
        </div>
    </div>
);

// Main Component
interface TeamHrViewProps {
  currentUser: User;
  allUsers: User[];
  timeOffRequests: TimeOffRequest[];
}

type TeamHrTab = 'profile' | 'time-off' | 'directory';

const TeamHrView: React.FC<TeamHrViewProps> = ({ currentUser, allUsers, timeOffRequests }) => {
  const [activeTab, setActiveTab] = useState<TeamHrTab>('profile');
  const myRequests = useMemo(() => timeOffRequests.filter(r => r.userId === currentUser.id), [timeOffRequests, currentUser.id]);

  const renderContent = () => {
    switch(activeTab) {
        case 'profile': return <MyProfileView user={currentUser} />;
        case 'time-off': return <TimeOffView user={currentUser} requests={myRequests} />;
        case 'directory': return <CompanyDirectory users={allUsers} />;
    }
  };

  return (
    <div>
        <div className="mb-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
                <button onClick={() => setActiveTab('profile')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'profile' ? 'border-violet-600 text-violet-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>My Profile</button>
                <button onClick={() => setActiveTab('time-off')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'time-off' ? 'border-violet-600 text-violet-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Time-Off</button>
                <button onClick={() => setActiveTab('directory')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'directory' ? 'border-violet-600 text-violet-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Company Directory</button>
            </nav>
        </div>
        {renderContent()}
    </div>
  );
};

export default TeamHrView;
