import React from 'react';
import { UserRole } from '../../types';
import ProfileSettings from './ProfileSettings';
import OrganizationSettings from './OrganizationSettings';
import AdminSettings from './AdminSettings';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

const SettingsView: React.FC = () => {
  const { currentUser } = useSelector((state: RootState) => state.users);

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
      
      {/* Personal Settings */}
      <ProfileSettings />

      {/* Organization Settings - Visible to all but editable by Executive */}
      <OrganizationSettings />

      {/* Admin/Executive Settings */}
      {currentUser.role === UserRole.EXECUTIVE && (
        <AdminSettings />
      )}
    </div>
  );
};

export default SettingsView;