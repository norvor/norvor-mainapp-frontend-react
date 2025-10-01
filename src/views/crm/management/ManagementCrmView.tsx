import React, { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store/store';
import { updateContact } from '../../../store/slices/contactSlice';
import { User, Contact, Deal } from '../../../types';
import DealKanban from '../../../components/crm/DealKanban';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const TeamPipelineView: React.FC<{teamMembers: User[], allTeamDeals: Deal[]}> = ({ teamMembers, allTeamDeals }) => {
    const [selectedMemberId, setSelectedMemberId] = useState<string | null>(teamMembers.length > 0 ? teamMembers[0].id : null);

    const selectedMemberDeals = useMemo(() => {
        if (!selectedMemberId) return [];
        return allTeamDeals.filter(d => d.ownerId === selectedMemberId);
    }, [selectedMemberId, allTeamDeals]);

    return (
        <div>
            <div className="mb-4">
                <label htmlFor="team-member-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Select Team Member</label>
                <select
                    id="team-member-select"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-violet-500 focus:border-violet-500 sm:text-sm rounded-md"
                    value={selectedMemberId || ''}
                    onChange={e => setSelectedMemberId(e.target.value)}
                >
                    {teamMembers.map(member => <option key={member.id} value={member.id}>{member.name}</option>)}
                </select>
            </div>
            {selectedMemberId ? <DealKanban deals={selectedMemberDeals} onDealClick={() => {}}/> : <p>Please select a team member.</p>}
        </div>
    );
};

const LeadAssignmentView: React.FC<{
  unassignedContacts: Contact[],
  teamMembers: User[],
  onAssignContact: (contactId: number, ownerId: string | null) => void
}> = ({ unassignedContacts, teamMembers, onAssignContact }) => (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Assign To</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {unassignedContacts.map(contact => (
                    <tr key={contact.id} className="bg-white dark:bg-gray-800">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{contact.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{contact.companyId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            <select
                                value={contact.ownerId || ''}
                                onChange={(e) => onAssignContact(contact.id, e.target.value || null)}
                                className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md text-sm"
                            >
                                <option value="">Unassigned</option>
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
                name: member.name.split(' ')[0],
                dealsWon: memberDeals.filter(d => d.stage === 'Won').length,
                totalDeals: memberDeals.length
            };
        });
    }, [teamMembers, allTeamDeals]);
    
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Deals Won by Rep</h3>
            <div style={{ width: '100%', height: 300 }} className="mt-4">
                <ResponsiveContainer>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                        <XAxis dataKey="name" tick={{ fill: '#A0AEC0' }} />
                        <YAxis tick={{ fill: '#A0AEC0' }} />
                        <Tooltip contentStyle={{ backgroundColor: '#2D3748', border: 'none' }} />
                        <Legend wrapperStyle={{ color: '#A0AEC0' }} />
                        <Bar dataKey="dealsWon" fill="#7C3AED" name="Deals Won" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

interface ManagementCrmViewProps {
  currentUser: User;
  teamMembers: User[];
}

type ManagementViewTab = 'pipeline' | 'assignment' | 'dashboard';

const ManagementCrmView: React.FC<ManagementCrmViewProps> = ({ currentUser, teamMembers }) => {
  const [activeTab, setActiveTab] = useState<ManagementViewTab>('pipeline');
  const dispatch: AppDispatch = useDispatch();

  const { contacts } = useSelector((state: RootState) => state.contacts);
  const { deals } = useSelector((state: RootState) => state.deals);
  
  const unassignedContacts = useMemo(() => contacts.filter(c => !c.ownerId), [contacts]);
  const allTeamDeals = useMemo(() => {
      const teamMemberIds = new Set(teamMembers.map(m => m.id));
      return deals.filter(d => teamMemberIds.has(d.ownerId));
  }, [deals, teamMembers]);

  const handleAssignContact = async (contactId: number, ownerId: string | null) => {
    const contactToUpdate = contacts.find(c => c.id === contactId);
    if (contactToUpdate) {
        try {
            await dispatch(updateContact({ ...contactToUpdate, ownerId })).unwrap();
        } catch (error) {
            console.error("Failed to assign contact:", error);
            alert("Error: Could not assign contact.");
        }
    }
  };

  const renderContent = () => {
    switch(activeTab) {
        case 'pipeline': return <TeamPipelineView teamMembers={teamMembers} allTeamDeals={allTeamDeals} />;
        case 'assignment': return <LeadAssignmentView unassignedContacts={unassignedContacts} teamMembers={teamMembers} onAssignContact={handleAssignContact} />;
        case 'dashboard': return <TeamDashboardView teamMembers={teamMembers} allTeamDeals={allTeamDeals} />;
        default: return null;
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Management CRM Portal</h1>
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button onClick={() => setActiveTab('pipeline')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'pipeline' ? 'border-violet-600 text-violet-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'}`}>
            Team Pipeline
          </button>
          <button onClick={() => setActiveTab('assignment')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'assignment' ? 'border-violet-600 text-violet-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'}`}>
            Lead Assignment
          </button>
          <button onClick={() => setActiveTab('dashboard')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'dashboard' ? 'border-violet-600 text-violet-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'}`}>
            Team Dashboard
          </button>
        </nav>
      </div>
      {renderContent()}
    </div>
  );
};

export default ManagementCrmView;