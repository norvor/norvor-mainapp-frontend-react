
import React from 'react';

const SocialView: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Social Hub</h1>
      <p className="text-gray-600 dark:text-gray-300">
        This is a placeholder for the Social section.
      </p>
      <div className="mt-6 border-t dark:border-gray-700 pt-6">
        <h2 className="text-lg font-semibold">Coming Soon:</h2>
        <ul className="list-disc list-inside mt-2 text-gray-500 dark:text-gray-400">
            <li>Company-wide announcements</li>
            <li>Social feed</li>
            <li>Event calendar</li>
        </ul>
      </div>
    </div>
  );
};

export default SocialView;
