// src/views/hr/executive/ExecutiveHrView.tsx

import React, { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux'; 
import { AppDispatch, RootState } from '../../../store/store';
import { User, UserRole } from '../../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { updateUserRole, fetchUsers } from '../../../store/slices/userSlice';


// --- Helper component for Role Management ---
const RolePermissionManagement: React.FC<{ users: User[]; onRoleChange: (userId: string, newRole: UserRole) => void }> = ({ users, onRoleChange }) => {
    // Memoize the list of roles for the dropdown
    const availableRoles = useMemo(() => Object.values(UserRole), []);

    return (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Role & Permission Management</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700/50"><tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Employee</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Department</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Current Role</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Change Role</th>
                    </tr></thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {users.map(u => (
                            <tr key={u.id}>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{u.name}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm">{u.department}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm">{u.role}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm">
                                    <select 
                                        defaultValue={u.role}
                                        onChange={(e) => onRoleChange(u.id, e.target.value as UserRole)}
                                        className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md text-sm p-1"
                                    >
                                        {availableRoles.map(role => (
                                            <option key={role} value={role}>{role}</option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">Changing a user's role here updates their access across the application.</p>
        </div>
    );
};


// Sub-components (EmployeeManagementView, HrReportsDashboard - kept for completeness)
const EmployeeManagementView: React.FC<{ users: User[] }> = ({ users }) => (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Employee Management</h3>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700/50"><tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Title</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Department</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                </tr></thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {users.map(u => (
                        <tr key={u.id}>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{u.name}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">{u.title}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">{u.department}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                                <button className="text-violet-600 hover:underline">View/Edit</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const HrReportsDashboard: React.FC<{ users: User[] }> = ({ users }) => {
    const headcountByDept = useMemo(() => {
        const counts = users.reduce((acc, user) => {
            acc[user.department] = (acc[user.department] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [users]);
    
    return (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">HR Reports</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h4 className="font-semibold text-gray-700 dark:text-gray-200">Headcount by Department</h4>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={headcountByDept} layout="vertical" margin={{ left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis type="category" dataKey="name" width={80} />
                            <Tooltip />
                            <Bar dataKey="value" fill="#7C3AED" name="Headcount" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex flex-col space-y-4">
                    <div className="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Employees</p>
                        <p className="text-2xl font-bold">{users.length}</p>
                    </div>
                    <div className="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Employee Turnover Rate</p>
                        <p className="text-2xl font-bold">8.5% (Sample)</p>
                    </div>
                </div>
            </div>
        </div>
    );
};


// Main Component
type ExecutiveHrTab = 'employees' | 'reports' | 'permissions';

const ExecutiveHrView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ExecutiveHrTab>('reports');
  const dispatch: AppDispatch = useDispatch();
  const { users: allUsers } = useSelector((state: RootState) => state.users);


  // Function to be passed down to handle the role change and dispatch the thunk
  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;

    if (!window.confirm(`Are you sure you want to change the role for ${user.name} to ${newRole}?`)) {
        // Revert the dropdown if the user cancels
        const select = document.querySelector(`select[data-user-id='${userId}']`) as HTMLSelectElement;
        if (select) select.value = user.role;
        return;
    }

    try {
        await dispatch(updateUserRole({ userId, role: newRole })).unwrap();
        await dispatch(fetchUsers()); // Refetch users to ensure UI is up-to-date
        alert(`Successfully set ${user.name}'s role to ${newRole}.`);
    } catch (error) {
        console.error("Failed to update user role:", error);
        alert(`Error updating role for ${user.name}. See console.`);
    }
};


  const renderContent = () => {
    switch(activeTab) {
        case 'employees': return <EmployeeManagementView users={allUsers} />;
        case 'reports': return <HrReportsDashboard users={allUsers} />;
        case 'permissions': 
            return <RolePermissionManagement 
                        users={allUsers} 
                        onRoleChange={handleRoleChange} 
                    />;
    }
  };

  return (
    <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Executive HR Control Center</h1>
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
                <button onClick={() => setActiveTab('employees')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'employees' ? 'border-violet-600 text-violet-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Employee Management</button>
                <button onClick={() => setActiveTab('reports')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'reports' ? 'border-violet-600 text-violet-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>HR Reports</button>
                <button onClick={() => setActiveTab('permissions')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'permissions' ? 'border-violet-600 text-violet-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Role & Permissions</button>
            </nav>
        </div>
        {renderContent()}
    </div>
  );
};

export default ExecutiveHrView;