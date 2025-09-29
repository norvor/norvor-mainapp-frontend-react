import React from 'react'; // <--- REMOVED useState, useEffect, useMemo
import { TEAMS } from '../../data/mockData';
// REMOVED apiClient import
import { User, Project, Ticket } from '../../types'; // Import types for our data

interface TeamHubViewProps {
  teamId?: string;
  teamMembers: User[]; // <--- NEW PROP
  projects: Project[]; // <--- NEW PROP
  tickets: Ticket[];   // <--- UPDATED PROP
}

const TeamHubView: React.FC<TeamHubViewProps> = ({ teamId, teamMembers, projects, tickets }) => { // <--- UPDATED PROPS
  const teamName = TEAMS.find(t => t.id === teamId)?.name || 'Unknown Team';

  // --- REMOVED: All local state for members, projects, tickets, loading, error ---
  // --- REMOVED: The entire useEffect block for fetching data ---

  // Loading/Error check is now simpler based on props
  if (!teamId || teamMembers.length === 0) {
    // Note: A simple check, assuming the global loading in App.tsx has completed.
    return <div className="text-center p-8">Team data is not available.</div>;
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Welcome to the {teamName} Hub</h1>
      <p className="text-gray-600 dark:text-gray-300 text-lg">
        This is the central workspace for your team.
      </p>
       <div className="mt-8 border-t dark:border-gray-700 pt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <h2 className="font-semibold text-gray-800 dark:text-gray-200">Team Members ({teamMembers.length})</h2>
                <ul className="text-sm text-gray-500 dark:text-gray-400 mt-2 space-y-1">
                  {teamMembers.map(member => <li key={member.id}>{member.name} - ({member.title})</li>)}
                </ul>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <h2 className="font-semibold text-gray-800 dark:text-gray-200">Active Projects ({projects.length})</h2>
                <ul className="text-sm text-gray-500 dark:text-gray-400 mt-2 space-y-1">
                  {projects.map(project => <li key={project.id}>{project.name}</li>)}
                </ul>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <h2 className="font-semibold text-gray-800 dark:text-gray-200">Recent Requests ({tickets.length})</h2>
                 <ul className="text-sm text-gray-500 dark:text-gray-400 mt-2 space-y-1">
                  {tickets.map(ticket => <li key={ticket.id}>{ticket.title}</li>)}
                </ul>
            </div>
       </div>
    </div>
  );
};

export default TeamHubView;