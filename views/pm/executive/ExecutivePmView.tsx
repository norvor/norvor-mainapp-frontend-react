import React, { useState, useMemo } from 'react';
import { User, Project, Task, ProjectStatus } from '../../../types';

// Sub-components
const getStatusColor = (status: ProjectStatus) => {
    switch(status) {
        case ProjectStatus.ON_TRACK: return 'bg-green-100 text-green-800';
        case ProjectStatus.AT_RISK: return 'bg-yellow-100 text-yellow-800';
        case ProjectStatus.OFF_TRACK: return 'bg-red-100 text-red-800';
        case ProjectStatus.COMPLETED: return 'bg-blue-100 text-blue-800';
        default: return 'bg-gray-100';
    }
}
const PortfolioDashboard: React.FC<{ projects: Project[], users: User[] }> = ({ projects, users }) => {
    const getManagerName = (id: number) => users.find(u => u.id === id)?.name || 'N/A';
    
    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Project Portfolio</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50"><tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Project Name</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Manager</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                    </tr></thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {projects.map(p => (
                            <tr key={p.id}>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{p.name}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm">{getManagerName(p.managerId)}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(p.status)}`}>{p.status}</span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm">
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div className="bg-violet-600 h-2.5 rounded-full" style={{width: `${p.progress}%`}}></div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const ResourceManagementView: React.FC<{ users: User[], tasks: Task[] }> = ({ users, tasks }) => {
    const taskCounts = useMemo(() => {
        return users.map(user => ({
            ...user,
            taskCount: tasks.filter(t => t.assigneeId === user.id).length
        }));
    }, [users, tasks]);

    return (
         <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Resource Allocation</h3>
            <div className="overflow-x-auto">
                 <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50"><tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Assigned Tasks</th>
                    </tr></thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {taskCounts.map(u => (
                            <tr key={u.id}>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{u.name}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm">{u.department}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold">{u.taskCount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
         </div>
    );
}

const RoadmapView: React.FC<{projects: Project[]}> = ({ projects }) => (
    <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Strategic Roadmap (Q3-Q4 2024)</h3>
        <div className="relative border-l border-gray-200 pl-4 space-y-8">
            {projects.map(project => (
                <div key={project.id}>
                    <div className={`absolute -left-1.5 mt-1.5 w-3 h-3 ${getStatusColor(project.status).split(' ')[0]} rounded-full`}></div>
                    <h4 className="font-semibold text-gray-800">{project.name}</h4>
                    <p className="text-xs text-gray-500">{project.startDate} - {project.endDate}</p>
                </div>
            ))}
        </div>
    </div>
);

// Main Component
interface ExecutivePmViewProps {
  allUsers: User[];
  projects: Project[];
  tasks: Task[];
}

type ExecutivePmTab = 'portfolio' | 'resources' | 'roadmap';

const ExecutivePmView: React.FC<ExecutivePmViewProps> = (props) => {
  const [activeTab, setActiveTab] = useState<ExecutivePmTab>('portfolio');
  
  const renderContent = () => {
    switch(activeTab) {
        case 'portfolio': return <PortfolioDashboard projects={props.projects} users={props.allUsers} />;
        case 'resources': return <ResourceManagementView users={props.allUsers} tasks={props.tasks} />;
        case 'roadmap': return <RoadmapView projects={props.projects} />;
    }
  };

  return (
    <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Executive PM Control Center</h1>
        <div className="mb-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
                <button onClick={() => setActiveTab('portfolio')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'portfolio' ? 'border-violet-600 text-violet-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Portfolio Dashboard</button>
                <button onClick={() => setActiveTab('resources')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'resources' ? 'border-violet-600 text-violet-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Resource Management</button>
                <button onClick={() => setActiveTab('roadmap')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'roadmap' ? 'border-violet-600 text-violet-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Roadmap</button>
            </nav>
        </div>
        {renderContent()}
    </div>
  );
};

export default ExecutivePmView;