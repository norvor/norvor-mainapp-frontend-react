import React, { useState } from 'react';
import { User, UserRole } from '../../types';
import apiClient from '../../utils/apiClient';
import { useDispatch } from 'react-redux';
import { fetchUsers } from '../../store/slices/userSlice';
import { AppDispatch } from '../../store/store';

interface AdminSettingsProps {
  allUsers: User[];
}

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
                    password: 'password123' // Default password
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch: AppDispatch = useDispatch();

  const handleUserAdded = () => {
    // Refetch the list of users to include the new one
    dispatch(fetchUsers());
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      {isModalOpen && <AddUserModal onClose={() => setIsModalOpen(false)} onUserAdded={handleUserAdded} />}
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
                  <button className="text-violet-600 hover:underline">Edit</button>
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