import React, { useState, useMemo } from 'react';
import { User, Contact, Deal, Activity } from '../../../types';
import DealKanban from '../../../components/crm/DealKanban';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Sub-components defined within the same file

const TeamPipelineView: React.FC<{teamMembers: User[], allTeamDeals: Deal[]}> = ({ teamMembers, allTeamDeals }) => {
    const [selectedMemberId, setSelectedMemberId] = useState<number | null>(teamMembers.length > 0 ? teamMembers[0].id : null);

    const selectedMemberDeals = useMemo(() => {
        if (!selectedMemberId) return [];
        return allTeamDeals.filter(d => d.ownerId === selectedMemberId);
    }, [selectedMemberId, allTeamDeals]);

    return (
        <div>
            <div className="mb-4">
                <label htmlFor="team-member-select" className="block text-sm font-medium text-gray-700">Select Team Member</label>
                <select 
                    id="team-member-select"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-violet-500 focus:border-violet-500 sm:text-sm rounded-md"
                    value={selectedMemberId || ''}
                    onChange={e => setSelectedMemberId(Number(e.target.value))}
                >
                    {teamMembers.map(member => <option key={member.id} value={member.id}>{member.name}</option>)}
                </select>
            </div>
            {selectedMemberId ? <DealKanban deals={selectedMemberDeals} /> : <p>Please select a team member.</p>}
        </div>
    );
};

const LeadAssignmentView: React.FC<{unassignedContacts: Contact[], teamMembers: User[]}> = ({ unassignedContacts, teamMembers }) => (
    <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assign To</th>
                </tr>
            </thead>
            <tbody>
                {unassignedContacts.map(contact => (
                    <tr key={contact.id} className="bg-white">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{contact.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contact.company}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <select className="border-gray-300 rounded-md text-sm">
                                <option>Unassigned</option>
                                {teamMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </select>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);


const TeamDashboardView: React.FC<{teamMembers: User[], allTeamDeals: Deal[]}> = ({ teamMembers, allTeamDeals }) => {
    const chartData = useMemo(() => {
        return teamMembers.map(member => {
            const memberDeals = allTeamDeals.filter(d => d.ownerId === member.id);
            return {
                name: member.name.split(' ')[0], // First name
                dealsWon: memberDeals.filter(d => d.stage === 'Won').length,
                totalDeals: memberDeals.length
            };
        });
    }, [teamMembers, allTeamDeals]);
    
    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-800">Deals Won by Rep</h3>
            <div style={{ width: '100%', height: 300 }} className="mt-4">
                <ResponsiveContainer>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="dealsWon" fill="#7C3AED" name="Deals Won" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

// Main Management View Component
interface ManagementCrmViewProps {
  currentUser: User;
  teamMembers: User[];
  unassignedContacts: Contact[];
  allTeamDeals: Deal[];
  allTeamContacts: Contact[];
}

type ManagementViewTab = 'pipeline' | 'assignment' | 'dashboard';

const ManagementCrmView: React.FC<ManagementCrmViewProps> = (props) => {
  const [activeTab, setActiveTab] = useState<ManagementViewTab>('pipeline');

  const renderContent = () => {
    switch(activeTab) {
        case 'pipeline': return <TeamPipelineView teamMembers={props.teamMembers} allTeamDeals={props.allTeamDeals} />;
        case 'assignment': return <LeadAssignmentView unassignedContacts={props.unassignedContacts} teamMembers={props.teamMembers} />;
        case 'dashboard': return <TeamDashboardView teamMembers={props.teamMembers} allTeamDeals={props.allTeamDeals} />;
        default: return null;
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Management CRM Portal</h1>
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button onClick={() => setActiveTab('pipeline')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'pipeline' ? 'border-violet-600 text-violet-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
            Team Pipeline
          </button>
          <button onClick={() => setActiveTab('assignment')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'assignment' ? 'border-violet-600 text-violet-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
            Lead Assignment
          </button>
          <button onClick={() => setActiveTab('dashboard')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'dashboard' ? 'border-violet-600 text-violet-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
            Team Dashboard
          </button>
        </nav>
      </div>
      {renderContent()}
    </div>
  );
};

export default ManagementCrmView;