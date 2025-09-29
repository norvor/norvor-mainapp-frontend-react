import React from 'react';

const DataLabsView: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Data Labs</h1>
      <p className="text-gray-600 dark:text-gray-300">
        This view is for the Data Labs module.
      </p>
      <div className="mt-6 border-t dark:border-gray-700 pt-6">
        <h2 className="text-lg font-semibold">Coming Soon:</h2>
        <ul className="list-disc list-inside mt-2 text-gray-500 dark:text-gray-400">
            <li>Step 1: Data Source Selection</li>
            <li>Step 2: Visual Data Joining</li>
            <li>Step 3: Visualization & Reporting</li>
        </ul>
      </div>
    </div>
  );
};

export default DataLabsView;