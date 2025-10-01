import React, { memo } from 'react';
import { Task, TaskStatus } from '../../types';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

const getStatusColor = (status: TaskStatus) => {
  switch (status) {
    case TaskStatus.TO_DO: return 'bg-gray-200 text-gray-800';
    case TaskStatus.IN_PROGRESS: return 'bg-blue-200 text-blue-800';
    case TaskStatus.DONE: return 'bg-green-200 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => (
  <div onClick={onClick} className="bg-white p-3 rounded-lg shadow-sm mb-3 cursor-pointer hover:shadow-md transition-shadow border border-gray-200">
    <p className="font-semibold text-sm text-gray-800">{task.name}</p>
    <div className="mt-2 flex justify-between items-center">
      <span className="text-xs text-gray-500">Due: {task.dueDate}</span>
      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>{task.status}</span>
    </div>
  </div>
);

export default memo(TaskCard);