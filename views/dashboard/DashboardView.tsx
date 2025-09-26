import React from 'react';
import { UserRole } from '../../types';

interface DashboardViewProps {
  role: UserRole;
}

const DashboardView: React.FC<DashboardViewProps> = ({ role }) => {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">{role} Control Center</h1>
      <p className="text-gray-600">
        This is the main dashboard area for the <span className="font-semibold">{role}</span> role. 
        According to the specification, this area would contain high-level, strategic widgets and data visualizations tailored for this role.
      </p>
       <div className="mt-6 border-t pt-6">
        <h2 className="text-lg font-semibold">Coming Soon:</h2>
        <ul className="list-disc list-inside mt-2 text-gray-500">
            <li>Customizable widget grid</li>
            <li>Key performance indicators (KPIs)</li>
            <li>Real-time data charts</li>
        </ul>
       </div>
    </div>
  );
};

export default DashboardView;