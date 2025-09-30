import React, { useState } from 'react';
import { OrganiserElement, UserRole } from '../../types';
import apiClient from '../../utils/apiClient';

interface NewUserInput {
  id: number | string; // Allow for temporary number ID
  name: string;
  email: string;
  role: UserRole;
  department: string;
}

interface AddUsersStepProps {
  departments: OrganiserElement[];
  onBack: () => void;
  onFinish: () => void;
}

const AddUsersStep: React.FC<AddUsersStepProps> = ({ departments, onBack, onFinish }) => {
  const [users, setUsers] = useState<NewUserInput[]>([
    { id: 1, name: '', email: '', role: UserRole.TEAM, department: departments[0]?.label || 'General' },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUserChange = (id: number | string, field: keyof NewUserInput, value: string) => {
    setUsers(users.map(u => u.id === id ? { ...u, [field]: value } : u));
  };

  const addUserRow = () => {
    setUsers([...users, { id: Date.now(), name: '', email: '', role: UserRole.TEAM, department: departments[0]?.label || 'General' }]);
  };
  
  const handleSubmit = async () => {
      setIsSubmitting(true);
      try {
        for (const user of users) {
          if (user.name && user.email) {
            await apiClient('/users/create_by_admin', {
              method: 'POST',
              body: JSON.stringify({ ...user, password: "password123" })
            });
          }
        }
        onFinish();
      } catch (err) {
        console.error("Failed to add users:", err);
        alert("An error occurred while adding users. Please check the console and try again.");
      } finally {
        setIsSubmitting(false);
      }
  };

  return (
     <div>
      <h2 className="text-xl font-bold text-center">Step 2: Add Your Team</h2>
      <p className="text-center mt-2 text-gray-500 dark:text-gray-400">
        Add initial members. They will be sent an email to set up their password later.
      </p>

      <div className="mt-6 space-y-4">
        {users.map(user => (
          <div key={user.id} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
            <input type="text" placeholder="Full Name" value={user.name} onChange={e => handleUserChange(user.id, 'name', e.target.value)} className="p-2 border rounded-md bg-transparent dark:border-gray-600" />
            <input type="email" placeholder="Email" value={user.email} onChange={e => handleUserChange(user.id, 'email', e.target.value)} className="p-2 border rounded-md bg-transparent dark:border-gray-600" />
            <select value={user.department} onChange={e => handleUserChange(user.id, 'department', e.target.value)} className="p-2 border rounded-md bg-transparent dark:border-gray-600 dark:bg-gray-800">
              {departments.map(d => <option key={d.id} value={d.label}>{d.label}</option>)}
              <option value="General">General</option>
            </select>
            <select value={user.role} onChange={e => handleUserChange(user.id, 'role', e.target.value as UserRole)} className="p-2 border rounded-md bg-transparent dark:border-gray-600 dark:bg-gray-800">
              <option value={UserRole.TEAM}>Team</option>
              <option value={UserRole.MANAGEMENT}>Management</option>
            </select>
          </div>
        ))}
         <button onClick={addUserRow} className="text-sm text-violet-600 hover:underline">+ Add another person</button>
      </div>

      <div className="text-center mt-8 flex justify-center space-x-4">
        <button onClick={onBack} className="px-8 py-3 bg-gray-200 text-gray-800 rounded-md font-semibold">Back</button>
        <button onClick={handleSubmit} disabled={isSubmitting} className="px-8 py-3 bg-violet-600 text-white rounded-md font-semibold disabled:bg-violet-400">
          {isSubmitting ? 'Saving...' : 'Finish & Launch'}
        </button>
      </div>
    </div>
  );
};

export default AddUsersStep;