
import React, { useState, useMemo } from 'react';
import { User, Project, Task, TaskStatus } from '../../../types';
import TaskKanban from '../../../components/pm/TaskKanban';

// Sub-components

const TaskDetailModal: React.FC<{ task: Task; project: Project; assignee: User; onClose: () => void; }> = ({ task, project, assignee, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-lg animate-fade-in-up">
            <div className="flex justify-between items-center pb-3 border-b">
                <h3 className="text-xl font-bold text-gray-900">{task.name}</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <div className="mt-4">
                <p className="text-sm text-gray-600">{task.description}</p>
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div><strong>Project:</strong> {project.name}</div>
                    <div><strong>Assignee:</strong> {assignee.name}</div>
                    <div><strong>Due Date:</strong> {task.dueDate}</div>
                    <div><strong>Status:</strong> <span className="font-semibold">{task.status}</span></div>
                </div>
                <div className="mt-6 border-t pt-4">
                    <h4 className="font-semibold text-gray-800">Comments</h4>
                    <div className="mt-2 text-sm text-gray-500">Comment functionality to be added.</div>
                </div>
            </div>
            <div className="mt-6 flex justify-end">
                <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 text-sm font-medium rounded-md hover:bg-gray-300">Close</button>
            </div>
        </div>
    </div>
);

const MyTasksView: React.FC<{ tasks: Task[]; projects: Project[]; onTaskClick: (task: Task) => void; }> = ({ tasks, projects, onTaskClick }) => {
    const getProjectName = (projectId: number) => projects.find(p => p.id === projectId)?.name || 'Unknown Project';
    
    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">My Assigned Tasks</h3>
             <div className="space-y-3">
                {tasks.map(task => (
                    <div key={task.id} onClick={() => onTaskClick(task)} className="p-3 border rounded-md flex justify-between items-center cursor-pointer hover:bg-gray-50">
                        <div>
                            <p className="font-medium">{task.name}</p>
                            <p className="text-sm text-gray-500">{getProjectName(task.projectId)}</p>
                        </div>
                         <div className="text-right">
                             <p className="text-sm font-semibold">{task.status}</p>
                             <p className="text-xs text-gray-500">Due: {task.dueDate}</p>
                         </div>
                    </div>
                ))}
                {tasks.length === 0 && <p className="text-center py-4 text-gray-500">No tasks assigned to you.</p>}
            </div>
        </div>
    );
};

const ProjectBoardView: React.FC<{ projects: Project[]; tasks: Task[]; onTaskClick: (task: Task) => void; }> = ({ projects, tasks, onTaskClick }) => {
    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(projects.length > 0 ? projects[0].id : null);

    const projectTasks = useMemo(() => {
        if (!selectedProjectId) return [];
        return tasks.filter(t => t.projectId === selectedProjectId);
    }, [selectedProjectId, tasks]);
    
    return (
        <div>
            <div className="mb-4">
                <label htmlFor="project-select" className="block text-sm font-medium text-gray-700">Select Project</label>
                <select 
                    id="project-select"
                    className="mt-1 block w-full md:w-1/3 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-violet-500 focus:border-violet-500 sm:text-sm rounded-md"
                    value={selectedProjectId || ''}
                    onChange={e => setSelectedProjectId(Number(e.target.value))}
                >
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
            </div>
            {selectedProjectId ? <TaskKanban tasks={projectTasks} onTaskClick={onTaskClick} /> : <p>Please select a project.</p>}
        </div>
    );
};


// Main Component
interface TeamPmViewProps {
  currentUser: User;
  projects: Project[];
  tasks: Task[];
  allUsers: User[];
}

type TeamPmTab = 'my-tasks' | 'project-board';

const TeamPmView: React.FC<TeamPmViewProps> = (props) => {
  const [activeTab, setActiveTab] = useState<TeamPmTab>('my-tasks');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const myTasks = useMemo(() => props.tasks.filter(t => t.assigneeId === props.currentUser.id), [props.tasks, props.currentUser.id]);
  const myProjects = useMemo(() => props.projects.filter(p => p.memberIds.includes(props.currentUser.id)), [props.projects, props.currentUser.id]);

  const handleTaskClick = (task: Task) => setSelectedTask(task);
  const handleCloseModal = () => setSelectedTask(null);

  const selectedTaskDetails = useMemo(() => {
      if (!selectedTask) return null;
      const project = props.projects.find(p => p.id === selectedTask.projectId);
      const assignee = props.allUsers.find(u => u.id === selectedTask.assigneeId);
      if (!project || !assignee) return null;
      return { project, assignee };
  }, [selectedTask, props.projects, props.allUsers]);


  const renderContent = () => {
    switch(activeTab) {
        case 'my-tasks': return <MyTasksView tasks={myTasks} projects={myProjects} onTaskClick={handleTaskClick} />;
        case 'project-board': return <ProjectBoardView projects={myProjects} tasks={props.tasks} onTaskClick={handleTaskClick}/>;
    }
  };

  return (
    <div>
      {selectedTask && selectedTaskDetails && (
        <TaskDetailModal 
            task={selectedTask} 
            project={selectedTaskDetails.project} 
            assignee={selectedTaskDetails.assignee}
            onClose={handleCloseModal} 
        />
      )}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button onClick={() => setActiveTab('my-tasks')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'my-tasks' ? 'border-violet-600 text-violet-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>My Tasks</button>
          <button onClick={() => setActiveTab('project-board')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'project-board' ? 'border-violet-600 text-violet-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Project Board</button>
        </nav>
      </div>
      {renderContent()}
    </div>
  );
};

export default TeamPmView;