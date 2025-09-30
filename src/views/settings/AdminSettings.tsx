import React, { useState } from 'react';
import { User, UserRole } from '../../types';
import apiClient from '../../utils/apiClient';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, updateUserDetails, fetchCurrentUser } from '../../store/slices/userSlice';
import { AppDispatch, RootState } from '../../store/store';

interface AdminSettingsProps {
  allUsers: User[];
}

// --- NEW EditUserModal Component ---
interface EditUserModalProps { 
    user: User; 
    currentUser: User;
    allUsers: User[]; 
    onClose: () => void; 
    onUserUpdated: () => void; 
}

const EditUserModal: React.FC<EditUserModalProps> = ({ user, currentUser, allUsers, onClose, onUserUpdated }) => {
    const dispatch: AppDispatch = useDispatch();
    
    const [name, setName] = useState(user.name);
    const [title, setTitle] = useState(user.title || '');
    const [department, setDepartment] = useState(user.department);
    const [role, setRole] = useState<UserRole>(user.role);
    const [managerId, setManagerId] = useState(user.managerId || '');
    const [phone, setPhone] = useState(user.phone || '');
    const [address, setAddress] = useState(user.address || '');
    const [emergencyContact, setEmergencyContact] = useState(user.emergencyContact || '');
    const [avatar, setAvatar] = useState(user.avatar || '');
    
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const availableRoles = Object.values(UserRole);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        
        const updatePayload: Partial<User> = {
            name,
            title,
            department,
            role,
            managerId: managerId || null, // Use null for JSON serialization (clearing the field)
            phone,
            address,
            emergencyContact,
            avatar,
        };

        try {
            await dispatch(updateUserDetails({ 
                userId: user.id, 
                update: updatePayload 
            })).unwrap();

            // 1. Refresh the main user list (allUsers)
            onUserUpdated(); 
            
            // 2. IMPORTANT: If the updated user is the current user, refresh currentUser state
            if (user.id === currentUser.id) {
                await dispatch(fetchCurrentUser()).unwrap(); 
            }
            
            onClose();
        } catch (err: any) {
            console.error('Failed to update user:', err);
            setError(err.message || 'Failed to update user details.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-2xl">
                <div className="flex justify-between items-center mb-6 border-b pb-3">
                    <h2 className="text-2xl font-bold">Edit User: {user.name}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-3xl leading-none">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    
                    <div className="grid grid-cols-2 gap-4">
                        {/* Primary Details */}
                        <div className="space-y-4 col-span-1">
                            <h3 className="font-semibold text-gray-700 dark:text-gray-200 border-b pb-2">Job Details</h3>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" required className="w-full p-2 border rounded bg-transparent dark:border-gray-600" />
                            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" required className="w-full p-2 border rounded bg-transparent dark:border-gray-600" />
                            <input type="text" value={department} onChange={e => setDepartment(e.target.value)} placeholder="Department" required className="w-full p-2 border rounded bg-transparent dark:border-gray-600" />
                            
                            <select value={role} onChange={e => setRole(e.target.value as UserRole)} className="w-full p-2 border rounded bg-transparent dark:border-gray-600 dark:bg-gray-800">
                                {availableRoles.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                            
                            <select value={managerId} onChange={e => setManagerId(e.target.value)} className="w-full p-2 border rounded bg-transparent dark:border-gray-600 dark:bg-gray-800">
                                <option value="">--- No Manager ---</option>
                                {allUsers.filter(u => u.id !== user.id).map(u => (
                                    <option key={u.id} value={u.id}>
                                        {u.name} ({u.role})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Contact Details */}
                        <div className="space-y-4 col-span-1">
                            <h3 className="font-semibold text-gray-700 dark:text-gray-200 border-b pb-2">Contact & Personal</h3>
                            <input type="email" value={user.email} disabled placeholder="Email (Non-Editable)" className="w-full p-2 border rounded bg-gray-100 dark:bg-gray-700 dark:border-gray-600 cursor-not-allowed" />
                            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone" className="w-full p-2 border rounded bg-transparent dark:border-gray-600" />
                            <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="Address" className="w-full p-2 border rounded bg-transparent dark:border-gray-600" />
                            <input type="text" value={emergencyContact} onChange={e => setEmergencyContact(e.target.value)} placeholder="Emergency Contact" className="w-full p-2 border rounded bg-transparent dark:border-gray-600" />
                            <input type="url" value={avatar} onChange={e => setAvatar(e.target.value)} placeholder="Avatar URL" className="w-full p-2 border rounded bg-transparent dark:border-gray-600" />
                            {/* --- EDITS APPLIED HERE --- */}
                            {avatar && (
                                <img 
                                    src={avatar} 
                                    alt="User Avatar" 
                                    className="h-10 w-10 rounded-full object-cover mt-2 mx-auto" 
                                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://placehold.co/40x40/cccccc/333333?text=AV' }}
                                />
                            )}
                            {/* --------------------------- */}
                        </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2 border-t pt-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 rounded bg-gray-200 text-gray-800 font-medium">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="px-6 py-2 rounded bg-violet-600 text-white font-medium disabled:bg-violet-400">
                            {isSubmitting ? 'Saving...' : 'Save All Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
// --- END EditUserModal Component ---


const AddUserModal: React.FC<{ onClose: () => void; onUserAdded: () => void; }> = ({ onClose, onUserAdded }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<UserRole>(UserRole.TEAM);
    const [department, setDepartment] = useState('General');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        try {
            await apiClient('/users/create_by_admin', {
                method: 'POST',
                body: JSON.stringify({
                    name,
                    email,
                    role,
                    department,
                    password: 'password123' 
                })
            });
            onUserAdded();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to add user');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Add New User</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                     {error && <p className="text-red-500 text-sm">{error}</p>}
                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" required className="w-full p-2 border rounded bg-transparent dark:border-gray-600" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required className="w-full p-2 border rounded bg-transparent dark:border-gray-600" />
                    <select value={role} onChange={e => setRole(e.target.value as UserRole)} className="w-full p-2 border rounded bg-transparent dark:border-gray-600 dark:bg-gray-800">
                        <option value={UserRole.TEAM}>Team</option>
                        <option value={UserRole.MANAGEMENT}>Management</option>
                        <option value={UserRole.EXECUTIVE}>Executive</option>
                    </select>
                    <input type="text" value={department} onChange={e => setDepartment(e.target.value)} placeholder="Department" required className="w-full p-2 border rounded bg-transparent dark:border-gray-600" />
                    <div className="flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200 text-gray-800">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded bg-violet-600 text-white disabled:bg-violet-400">
                            {isSubmitting ? 'Adding...' : 'Add User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const AdminSettings: React.FC<AdminSettingsProps> = ({ allUsers }) => {
  const { currentUser } = useSelector((state: RootState) => state.users);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null); 
  const dispatch: AppDispatch = useDispatch();

  const handleUserRefresh = () => {
    dispatch(fetchUsers());
  };

  const handleEditClick = (user: User) => { 
    setEditingUser(user);
  };
  
  const handleCloseEdit = () => { 
    setEditingUser(null);
  };


  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      {isModalOpen && <AddUserModal onClose={() => setIsModalOpen(false)} onUserAdded={handleUserRefresh} />}
      {editingUser && <EditUserModal user={editingUser} currentUser={currentUser!} allUsers={allUsers} onClose={handleCloseEdit} onUserUpdated={handleUserRefresh} />} 
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">User Management</h2>
        <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-md hover:bg-violet-700">
            + Add User
        </button>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Manage users and roles within your organization.</p>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Name</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Email</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Role</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Manager</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {allUsers.map(user => (
              <tr key={user.id}>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{user.name}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">{user.email}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">{user.role}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {allUsers.find(u => u.id === user.managerId)?.name || 'N/A'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  <button onClick={() => handleEditClick(user)} className="text-violet-600 hover:underline">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminSettings;
