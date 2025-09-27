
import React from 'react';
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

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ status, tasks, onTaskClick }) => (
  <div className="flex-shrink-0 w-72 bg-gray-100 rounded-lg p-3">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-sm font-semibold text-gray-600">{status}</h3>
      <span className="text-xs font-bold text-gray-400 bg-gray-200 rounded-full px-2 py-1">{tasks.length}</span>
    </div>
    <div className="h-full overflow-y-auto">
      {tasks.map(task => <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />)}
    </div>
  </div>
);

interface TaskKanbanProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

const TaskKanban: React.FC<TaskKanbanProps> = ({ tasks, onTaskClick }) => {
  const statuses = Object.values(TaskStatus);
  
  const tasksByStatus = (status: TaskStatus) => tasks.filter(task => task.status === status);

  return (
    <div className="flex space-x-4 overflow-x-auto pb-4">
      {statuses.map(status => (
        <KanbanColumn key={status} status={status} tasks={tasksByStatus(status)} onTaskClick={onTaskClick} />
      ))}
    </div>
  );
};

export default TaskKanban;
