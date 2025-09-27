
import React from 'react';

const DashboardView: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Central Dashboard</h1>
      <p className="text-gray-600 dark:text-gray-300">
        This is the main dashboard area. It will contain high-level, strategic widgets and data visualizations for a company-wide overview.
      </p>
       <div className="mt-6 border-t dark:border-gray-700 pt-6">
        <h2 className="text-lg font-semibold">Coming Soon:</h2>
        <ul className="list-disc list-inside mt-2 text-gray-500 dark:text-gray-400">
            <li>Customizable widget grid</li>
            <li>Key performance indicators (KPIs)</li>
            <li>Real-time data charts</li>
        </ul>
       </div>
    </div>
  );
};

export default DashboardView;
