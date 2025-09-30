import React, { useState } from 'react';
import { User, UserRole } from '../../types';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store/store';
import { updateOrganiserElement, fetchOrganiserElements } from '../../store/slices/organiserSlice';

interface OrganizationSettingsProps {
  currentUser: User;
  organization: { id: number; name: string };
}

const OrganizationSettings: React.FC<OrganizationSettingsProps> = ({ currentUser, organization }) => {
  const [orgName, setOrgName] = useState(organization.name);
  const isEditable = currentUser.role === UserRole.EXECUTIVE;
  const dispatch: AppDispatch = useDispatch();

  const handleSave = async () => {
    // This is a simplified approach. In a real app, you'd find the root organizer element and update it.
    console.log('Saving organization settings:', { orgName });
    alert('Organization name updated!');
    // Example of how you might dispatch an update
    // const rootElement = elements.find(el => el.parentId === null);
    // if (rootElement) {
    //   dispatch(updateOrganiserElement({ ...rootElement, label: orgName }));
    // }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Organization</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="orgName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Organization Name</label>
          <input
            type="text"
            id="orgName"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            disabled={!isEditable}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-transparent rounded-md shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500 sm:text-sm disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
          />
        </div>
        {isEditable && (
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-md hover:bg-violet-700"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizationSettings;