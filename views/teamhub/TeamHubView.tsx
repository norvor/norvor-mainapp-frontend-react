
import React from 'react';
import { TEAMS } from '../../data/mockData';

interface TeamHubViewProps {
  teamId?: string;
}

const TeamHubView: React.FC<TeamHubViewProps> = ({ teamId }) => {
  const teamName = TEAMS.find(t => t.id === teamId)?.name || 'Unknown Team';
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Welcome to the {teamName} Hub</h1>
      <p className="text-gray-600 dark:text-gray-300 text-lg">
        This is the central workspace for your team.
      </p>
       <div className="mt-8 border-t dark:border-gray-700 pt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <h2 className="font-semibold text-gray-800 dark:text-gray-200">Team Members</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">A list of team members and their roles will appear here.</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <h2 className="font-semibold text-gray-800 dark:text-gray-200">Active Projects</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">A summary of the team's active projects from the PM module.</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <h2 className="font-semibold text-gray-800 dark:text-gray-200">Recent Requests</h2>
                 <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">A feed of incoming requests from the 'Requests' module.</p>
            </div>
       </div>
    </div>
  );
};

export default TeamHubView;