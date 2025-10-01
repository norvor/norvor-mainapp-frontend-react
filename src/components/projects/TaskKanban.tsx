import React from 'react';
import { Task, TaskStatus } from '../../types';
import TaskCard from '../projects/TaskCard';

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