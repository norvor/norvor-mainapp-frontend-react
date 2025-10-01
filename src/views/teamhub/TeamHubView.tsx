import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { User, Project, Ticket } from '../../types';

interface TeamHubViewProps {
  elementId?: string;
  teamMembers: User[];
}

const TeamHubView: React.FC<TeamHubViewProps> = ({ elementId, teamMembers }) => {
  const { organiserElements } = useSelector((state: RootState) => state.organiserElements);
  const { projects } = useSelector((state: RootState) => state.projects);
  const { tickets: allTickets } = useSelector((state: RootState) => state.tickets);

  const tickets = useMemo(() => {
    if (!elementId) return [];
    return allTickets.filter(t => t.teamId === elementId);
  }, [allTickets, elementId]);

  const teamElement = useMemo(() => {
    if (!elementId) return null;
    return organiserElements.find(el => el.id === elementId);
  }, [elementId, organiserElements]);

  const teamName = teamElement?.label || 'Team/Department';

  if (!elementId) {
    return (
        <div className="text-center p-8 bg-white dark:bg-gray-800 shadow rounded-lg">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Welcome to the Hub</h1>
            <p className="text-gray-600 dark:text-gray-300">No team or department is selected.</p>
        </div>
    );
  }

  const membersWithRoles = useMemo(() => {
    const teamSpecificMembers = (teamElement?.properties?.members as { userId: string, teamRole: string, teamDesignation: string }[]) || [];
    
    return teamMembers.map(user => {
      const teamData = teamSpecificMembers.find(m => m.userId === user.id);
      return {
        user,
        teamRole: teamData?.teamRole || 'Member',
        teamDesignation: teamData?.teamDesignation || user.title || 'N/A',
      };
    });
  }, [teamMembers, teamElement]);


  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Welcome to the {teamName} Hub</h1>
      <p className="text-gray-600 dark:text-gray-300 text-lg mb-6">
        This is your team's central workspace for collaboration and tracking.
      </p>
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
                {/* Roster Widget */}
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <h2 className="font-semibold text-gray-800 dark:text-gray-200 text-xl mb-3">Team Roster ({membersWithRoles.length})</h2>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {membersWithRoles.map(member => (
                        <div key={member.user.id} className="p-3 border dark:border-gray-600 rounded-md flex justify-between items-center bg-white dark:bg-gray-800">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{member.user.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {member.teamDesignation} | <span className="font-semibold">{member.teamRole}</span>
                            </p>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{member.user.department}</p>
                        </div>
                      ))}
                       {membersWithRoles.length === 0 && (
                          <div className="text-center py-4 text-gray-400">No members have been assigned to this team yet.</div>
                      )}
                    </div>
                </div>

                {/* Projects Widget */}
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <h2 className="font-semibold text-gray-800 dark:text-gray-200 text-xl mb-3">Active Projects ({projects.length})</h2>
                     <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-2 max-h-96 overflow-y-auto">
                        {projects.map(project => (
                            <li key={project.id} className="p-2 border-b dark:border-gray-600">
                                <span className="font-medium">{project.name}</span> - {project.status} ({project.progress}%)
                            </li>
                        ))}
                        {projects.length === 0 && (
                           <li className="text-center py-4 text-gray-400">No projects for this team yet.</li>
                        )}
                    </ul>
                </div>
            </div>
            
            {/* Pending Requests Widget */}
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <h2 className="font-semibold text-gray-800 dark:text-gray-200 text-xl mb-3">Pending Requests ({tickets.filter(t => t.status !== 'Closed').length})</h2>
                <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-2 max-h-96 overflow-y-auto">
                  {tickets.filter(t => t.status !== 'Closed').map(ticket => (
                    <li key={ticket.id} className="p-2 border-b dark:border-gray-600">
                        <span className="font-medium">{ticket.title}</span> - {ticket.status}
                    </li>
                  ))}
                  {tickets.filter(t => t.status !== 'Closed').length === 0 && (
                      <li className="text-center py-4 text-gray-400">No open requests. Good job!</li>
                  )}
                </ul>
            </div>
       </div>
    </div>
  );
};

export default TeamHubView;