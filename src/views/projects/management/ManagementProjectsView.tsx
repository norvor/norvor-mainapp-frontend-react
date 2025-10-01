import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { User, Project, Task } from '../../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

// Sub-components
const ProjectCreationForm: React.FC<{teamMembers: User[]}> = ({ teamMembers }) => (
    <div className="bg-white shadow rounded-lg p-6 max-w-2xl mx-auto">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Create New Project</h3>
        <form className="space-y-4">
            <div>
                <label className="text-sm font-medium">Project Name</label>
                <input type="text" className="w-full mt-1 p-2 border rounded-md text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium">Start Date</label>
                    <input type="date" className="w-full mt-1 p-2 border rounded-md text-sm" />
                </div>
                <div>
                    <label className="text-sm font-medium">End Date</label>
                    <input type="date" className="w-full mt-1 p-2 border rounded-md text-sm" />
                </div>
            </div>
             <div>
                <label className="text-sm font-medium">Add Members</label>
                <select multiple className="w-full mt-1 p-2 border rounded-md text-sm h-32">
                    {teamMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
            </div>
            <button type="button" className="w-full px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-md hover:bg-violet-700">Create Project</button>
        </form>
    </div>
);

const GanttChartView: React.FC<{projects: Project[], tasks: Task[]}> = ({ projects, tasks }) => (
    <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Project Gantt Chart</h3>
        <p className="text-sm text-gray-500 mb-4">Simplified project timeline view.</p>
        <div className="space-y-6">
            {projects.map(project => (
                <div key={project.id}>
                    <h4 className="font-semibold">{project.name}</h4>
                    <div className="mt-2 space-y-2">
                        {tasks.filter(t => t.projectId === project.id).map(task => (
                            <div key={task.id} className="flex items-center">
                                <p className="w-1/4 text-sm truncate pr-2">{task.name}</p>
                                <div className="w-3/4 bg-gray-200 rounded-full h-4">
                                    <div className="bg-blue-600 h-4 rounded-full" style={{width: '50%', marginLeft: '10%'}}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const ProjectReportsView: React.FC<{projects: Project[]}> = ({ projects }) => {
    const burndownData = [
        { name: 'Sprint 1', remaining: 40, planned: 40 },
        { name: 'Sprint 2', remaining: 25, planned: 30 },
        { name: 'Sprint 3', remaining: 10, planned: 20 },
        { name: 'Sprint 4', remaining: 5, planned: 10 },
    ];

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Project Burndown Chart (Sample)</h3>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={burndownData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="planned" stroke="#2563EB" name="Planned" />
                    <Line type="monotone" dataKey="remaining" stroke="#7C3AED" name="Remaining Work" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

// Main Component
interface ManagementProjectsViewProps {
  teamMembers: User[];
}

type ManagementProjectsTab = 'create' | 'gantt' | 'reports';

const ManagementProjectsView: React.FC<ManagementProjectsViewProps> = ({ teamMembers }) => {
  const { projects } = useSelector((state: RootState) => state.projects);
  const { tasks } = useSelector((state: RootState) => state.tasks);
  const { currentUser } = useSelector((state: RootState) => state.users);

  const [activeTab, setActiveTab] = useState<ManagementProjectsTab>('gantt');

  const managedProjects = useMemo(() => {
    if (!currentUser) return [];
    return projects.filter(p => 
        teamMembers.some(tm => tm.id === p.managerId) || p.managerId === currentUser.id
    );
  }, [projects, teamMembers, currentUser]);

  const renderContent = () => {
    switch(activeTab) {
        case 'create': return <ProjectCreationForm teamMembers={teamMembers}/>;
        case 'gantt': return <GanttChartView projects={managedProjects} tasks={tasks} />;
        case 'reports': return <ProjectReportsView projects={managedProjects}/>;
    }
  };

  return (
    <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Management Projects Portal</h1>
        <div className="mb-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
                <button onClick={() => setActiveTab('create')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'create' ? 'border-violet-600 text-violet-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Create Project</button>
                <button onClick={() => setActiveTab('gantt')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'gantt' ? 'border-violet-600 text-violet-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Gantt Chart</button>
                <button onClick={() => setActiveTab('reports')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'reports' ? 'border-violet-600 text-violet-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Project Reports</button>
            </nav>
        </div>
        {renderContent()}
    </div>
  );
};

export default ManagementProjectsView;