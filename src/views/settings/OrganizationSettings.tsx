import React, { useState, useEffect, useMemo } from 'react';
import { UserRole } from '../../types';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { updateOrganiserElement } from '../../store/slices/organiserSlice';

const OrganizationSettings: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { currentUser } = useSelector((state: RootState) => state.users);
  const { organiserElements } = useSelector((state: RootState) => state.organiserElements);

  const organizationElement = useMemo(() => 
    organiserElements.find(el => el.parentId === null && el.type === 'Department'),
    [organiserElements]
  );
  
  const [orgName, setOrgName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (organizationElement) {
      setOrgName(organizationElement.label);
    }
  }, [organizationElement]);

  if (!currentUser) {
    return <div>Loading...</div>;
  }
  
  const isEditable = currentUser.role === UserRole.EXECUTIVE;

  const handleSave = async () => {
    if (!organizationElement || !isEditable || orgName === organizationElement.label) return;

    setIsSaving(true);
    try {
      const updatedElement = { ...organizationElement, label: orgName };
      await dispatch(updateOrganiserElement(updatedElement)).unwrap();
      alert('Organization name updated successfully!');
    } catch (error) {
      console.error("Failed to update organization name:", error);
      alert("Error: Could not update organization name.");
    } finally {
      setIsSaving(false);
    }
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
            disabled={!isEditable || isSaving}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-transparent rounded-md shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500 sm:text-sm disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
          />
        </div>
        {isEditable && (
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving || orgName === organizationElement?.label}
              className="px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-md hover:bg-violet-700 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizationSettings;