import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store/store';
import { CrmTask, CrmTaskStatus, User } from '../../types';
import { createCrmTask } from '../../store/slices/crmTaskSlice';

interface CrmTaskWidgetProps {
  tasks: CrmTask[];
  users: User[];
  currentUser: User;
  associatedId: { contactId?: number; dealId?: number };
}

const CrmTaskWidget: React.FC<CrmTaskWidgetProps> = ({ tasks, users, currentUser, associatedId }) => {
  const dispatch: AppDispatch = useDispatch();
  const [taskTitle, setTaskTitle] = useState('');
  const [dueDate, setDueDate] = useState('');

  const getUserName = (ownerId: string) => users.find(u => u.id === ownerId)?.name || 'Unknown';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle || !dueDate) return;

    const newTask: Omit<CrmTask, 'id'> = {
      title: taskTitle,
      dueDate: new Date(dueDate).toISOString(),
      status: CrmTaskStatus.NOT_STARTED,
      ownerId: currentUser.id,
      ...associatedId,
    };

    try {
      await dispatch(createCrmTask(newTask)).unwrap();
      setTaskTitle('');
      setDueDate('');
    } catch (error) {
      console.error("Failed to create CRM Task:", error);
      alert("Error: Could not create task.");
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Tasks ({tasks.length})</h3>
      
      {/* Task Creation Form */}
      <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg bg-gray-50 dark:bg-gray-700/50 dark:border-gray-600 space-y-3">
        <input
          type="text"
          value={taskTitle}
          onChange={(e) => setTaskTitle(e.target.value)}
          placeholder="New task title..."
          className="w-full p-2 border rounded-md bg-transparent dark:border-gray-600"
        />
        <div className="flex space-x-2">
          <input
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="flex-1 p-2 border rounded-md bg-transparent dark:border-gray-600"
          />
          <button type="submit" className="px-4 py-2 bg-violet-600 text-white rounded-md font-medium hover:bg-violet-700 disabled:bg-violet-400" disabled={!taskTitle || !dueDate}>
            Add Task
          </button>
        </div>
      </form>

      {/* Task List */}
      <div className="space-y-3">
        {tasks.map(task => (
          <div key={task.id} className="p-3 border dark:border-gray-700 rounded-lg flex justify-between items-center">
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{task.title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Due: {new Date(task.dueDate).toLocaleString()} | Owner: {getUserName(task.ownerId)}
              </p>
            </div>
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200">{task.status}</span>
          </div>
        ))}
        {tasks.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No tasks scheduled.</p>}
      </div>
    </div>
  );
};

export default CrmTaskWidget;