import React from 'react';
import { User, UserRole } from '../../types';
import ProfileSettings from './ProfileSettings';
import OrganizationSettings from './OrganizationSettings';
import AdminSettings from './AdminSettings';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

const SettingsView: React.FC = () => {
  const { currentUser, users } = useSelector((state: RootState) => state.users);
  const { organiserElements } = useSelector((state: RootState) => state.organiserElements);

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  // Find the root organization element to get the name
  const organizationElement = organiserElements.find(el => el.parentId === null && el.type === 'Department');
  const organizationName = organizationElement ? organizationElement.label : 'Your Organization';

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
      
      {/* Personal Settings */}
      <ProfileSettings currentUser={currentUser} />

      {/* Organization Settings - Visible to all but editable by Executive */}
      <OrganizationSettings 
        currentUser={currentUser} 
        organization={{ id: currentUser.organization.id, name: organizationName }} 
      />

      {/* Admin/Executive Settings */}
      {currentUser.role === UserRole.EXECUTIVE && (
        <AdminSettings allUsers={users} />
      )}
    </div>
  );
};

export default SettingsView;