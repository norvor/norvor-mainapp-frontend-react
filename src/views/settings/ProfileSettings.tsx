import React, { useState, useEffect } from 'react'; // <-- ADDED useEffect
import { User } from '../../types';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store/store';
import { updateUserDetails, fetchCurrentUser } from '../../store/slices/userSlice'; // Import thunks

interface ProfileSettingsProps {
  currentUser: User;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ currentUser }) => {
  const dispatch: AppDispatch = useDispatch();
  const [name, setName] = useState(currentUser.name);
  const [avatar, setAvatar] = useState(currentUser.avatar || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // FIX: Reset local state if the currentUser object updates (important if a different part of the app updates the user)
  useEffect(() => {
      setName(currentUser.name);
      setAvatar(currentUser.avatar || '');
  }, [currentUser]);
  
  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    // FIX: Ensure null is sent for optional fields if empty.
    const updatePayload = {
      name,
      avatar: avatar || null, // Send null if the avatar string is empty
    };

    try {
      // 1. Send update to the backend
      // We rely on updateUserDetails being correctly implemented to convert avatar (camelCase)
      // to avatar (snake_case) in the backend payload.
      await dispatch(updateUserDetails({ 
          userId: currentUser.id, 
          update: updatePayload 
      })).unwrap();
      
      // 2. Fetch the current user to synchronize the header/sidebar display
      // This is crucial for UI components that rely on the Redux state object.
      await dispatch(fetchCurrentUser()).unwrap(); 
      
      alert('Profile settings saved successfully!');
    } catch (err) {
      console.error('Failed to save profile settings:', err);
      setError('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">My Profile</h2>
      {error && <div className="p-3 bg-red-100 text-red-700 rounded-md mb-4">{error}</div>}
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <img 
            key={avatar} // This forces React to create a new <img> element when avatar changes
            src={avatar || 'https://placehold.co/56x56/cccccc/333333?text=AV'} 
            alt="User Avatar" 
            className="h-14 w-14 rounded-full object-cover" 
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://placehold.co/56x56/cccccc/333333?text=AV' }}
          />
          <div className="flex-1">
            <label htmlFor="avatar" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Avatar URL</label>
             <input
              type="url"
              id="avatar"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="e.g., https://picsum.photos/200"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-transparent rounded-md shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500 sm:text-sm"
            />
          </div>
        </div>
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-transparent rounded-md shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
          <input
            type="email"
            id="email"
            value={currentUser.email}
            readOnly
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 rounded-md shadow-sm sm:text-sm cursor-not-allowed"
          />
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-md hover:bg-violet-700 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
