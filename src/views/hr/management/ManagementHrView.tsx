import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { User, TimeOffRequest, RequestStatus } from '../../../types';

// Sub-components
const LeaveApprovalQueue: React.FC<{ requests: TimeOffRequest[], users: User[] }> = ({ requests, users }) => {
    const pendingRequests = requests.filter(r => r.status === RequestStatus.PENDING);
    const getUserName = (id: string) => users.find(u => u.id === id)?.name || 'Unknown';

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Leave Approval Queue</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50"><tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr></thead>
                    <tbody>
                    {pendingRequests.map(r => (
                        <tr key={r.id}>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">{getUserName(r.userId)}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">{r.startDate} to {r.endDate}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">{r.type}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm space-x-2">
                                <button className="px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-md">Approve</button>
                                <button className="px-3 py-1 bg-red-500 text-white text-xs font-medium rounded-md">Deny</button>
                            </td>
                        </tr>
                    ))}
                    {pendingRequests.length === 0 && (
                        <tr><td colSpan={4} className="text-center py-4 text-gray-500">No pending requests.</td></tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const TeamCalendarView: React.FC = () => (
    <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Team Calendar</h3>
        <p className="text-gray-500">A calendar view showing approved time-off for the team would be displayed here.</p>
    </div>
);

const PerformanceReviewView: React.FC<{ directReports: User[] }> = ({ directReports }) => (
     <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Reviews</h3>
        <div className="space-y-3">
            {directReports.map(report => (
                <div key={report.id} className="p-3 border rounded-md flex justify-between items-center">
                    <div>
                        <p className="font-medium">{report.name}</p>
                        <p className="text-sm text-gray-500">{report.title}</p>
                    </div>
                    <button className="px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-md hover:bg-violet-700">Start Review</button>
                </div>
            ))}
        </div>
    </div>
);

// Main Component
interface ManagementHrViewProps {
  directReports: User[];
}

type ManagementHrTab = 'approvals' | 'calendar' | 'reviews';

const ManagementHrView: React.FC<ManagementHrViewProps> = ({ directReports }) => {
  const [activeTab, setActiveTab] = useState<ManagementHrTab>('approvals');
  const { timeOffRequests } = useSelector((state: RootState) => state.timeOffRequests);

  const teamTimeOffRequests = useMemo(() => {
    const directReportIds = new Set(directReports.map(dr => dr.id));
    return timeOffRequests.filter(r => directReportIds.has(r.userId));
  }, [timeOffRequests, directReports]);
  
  const renderContent = () => {
    switch(activeTab) {
        case 'approvals': return <LeaveApprovalQueue requests={teamTimeOffRequests} users={directReports} />;
        case 'calendar': return <TeamCalendarView />;
        case 'reviews': return <PerformanceReviewView directReports={directReports} />;
    }
  };

  return (
    <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Management HR Portal</h1>
        <div className="mb-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
                <button onClick={() => setActiveTab('approvals')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'approvals' ? 'border-violet-600 text-violet-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Leave Approvals</button>
                <button onClick={() => setActiveTab('calendar')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'calendar' ? 'border-violet-600 text-violet-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Team Calendar</button>
                <button onClick={() => setActiveTab('reviews')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'reviews' ? 'border-violet-600 text-violet-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Performance Reviews</button>
            </nav>
        </div>
        {renderContent()}
    </div>
  );
};

export default ManagementHrView;