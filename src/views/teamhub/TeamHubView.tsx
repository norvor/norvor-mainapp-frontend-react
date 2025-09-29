import React, { useState, useEffect } from 'react';
import { TEAMS } from '../../data/mockData';
import apiClient from '../../utils/apiClient'; // Import our new API client
import { User, Project, Ticket } from '../../types'; // Import types for our data

interface TeamHubViewProps {
  teamId?: string;
}

const TeamHubView: React.FC<TeamHubViewProps> = ({ teamId }) => {
  const teamName = TEAMS.find(t => t.id === teamId)?.name || 'Unknown Team';

  // State to hold the real data we fetch from the backend
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!teamId) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch all data in parallel for efficiency
        const [usersData, projectsData, ticketsData] = await Promise.all([
          apiClient('/users/'),
          apiClient('/pm/projects/'),
          apiClient(`/requests/tickets/team/${teamId}`)
        ]);

        // In a real app, you'd filter users and projects by teamId on the backend
        // For now, we'll just display all of them as an example
        setTeamMembers(usersData);
        setProjects(projectsData);
        setTickets(ticketsData);

      } catch (err: any) {
        setError(err.message || "Failed to fetch team hub data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [teamId]); // This effect runs whenever the teamId changes

  if (isLoading) {
    return <div className="text-center p-8">Loading Team Hub...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">Error: {error}</div>;
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