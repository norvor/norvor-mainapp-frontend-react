import React from 'react';

interface TeamDashboardViewProps {
  teamId?: string;
  teamName?: string;
}

const TeamDashboardView: React.FC<TeamDashboardViewProps> = ({ teamId, teamName }) => {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Team Dashboard: {teamName}</h1>
      <p className="text-gray-600">
        This is the main dashboard area for <span className="font-semibold">{teamName}</span> (ID: {teamId}).
      </p>
       <div className="mt-6 border-t pt-6">
        <h2 className="text-lg font-semibold">Coming Soon:</h2>
        <ul className="list-disc list-inside mt-2 text-gray-500">
            <li>Team-specific KPIs</li>
            <li>Project status overviews</li>
            <li>Team announcements</li>
        </ul>
       </div>
    </div>
  );
};

export default TeamDashboardView;