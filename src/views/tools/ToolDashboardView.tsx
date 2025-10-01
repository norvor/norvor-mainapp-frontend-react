import React, { useMemo, useState } from 'react';
import { User, UserRole } from '../../types';
import { Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

interface ToolDashboardViewProps {
  toolId: string;
  currentUser: User; 
}

// --- Generic Widget Components ---

const StatusWidget: React.FC<{ toolId: string, currentUser: User }> = ({ toolId, currentUser }) => {
    // Determine contextually relevant status info
    let statusText = "Ready to go!";
    let metric = 0;
    
    if (toolId === 'pm' || toolId === 'projects') {
        statusText = "Tasks Due This Week";
        metric = 5; // Placeholder
    } else if (toolId === 'crm') {
        statusText = "New Leads This Month";
        metric = 12; // Placeholder
    } else if (toolId === 'hr') {
        statusText = "Pending Time-Off Requests";
        metric = currentUser.role === UserRole.TEAM ? 1 : 2; // Placeholder
    }

    return (
        <div className="p-5 bg-white dark:bg-gray-800 rounded-lg shadow-md border dark:border-slate-700 col-span-1">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Current Status</h3>
            <div className="text-center">
                <p className="text-5xl font-extrabold text-violet-600">{metric}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{statusText}</p>
            </div>
        </div>
    );
};

const OpenItemsWidget: React.FC<{ toolId: string, currentUser: User }> = ({ toolId, currentUser }) => {
    // Determine contextually relevant open items
    let openItemCount = 0;
    let itemLabel = "Open Items";

    if (toolId === 'pm' || toolId === 'projects') {
        openItemCount = 8;
        itemLabel = "Tasks In Progress";
    } else if (toolId === 'crm') {
        openItemCount = 4; 
        itemLabel = "Deals in Negotiation";
    } else if (toolId === 'hr') {
        openItemCount = 1;
        itemLabel = "Time Off Requests";
    }
    
    return (
        <div className="p-5 bg-white dark:bg-gray-800 rounded-lg shadow-md border dark:border-slate-700 col-span-1">
             <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">My Open Items</h3>
            <div className="text-center">
                <p className="text-5xl font-extrabold text-blue-600">{openItemCount}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{itemLabel}</p>
            </div>
        </div>
    );
};

// --- Main ToolDashboardView Component ---
const ToolDashboardView: React.FC<ToolDashboardViewProps> = ({ toolId, currentUser }) => {
    const { teamId: elementId } = useParams<{ teamId: string }>(); 

    // --- 1. Define View Options based on User Role ---
    const VIEWS = useMemo(() => {
        let options = [];
        
        // Team View: Always available
        options.push({ id: UserRole.TEAM, label: 'Team View', requiredRole: UserRole.TEAM });

        // Management View: Available if user role is Management or Executive
        if (currentUser.role === UserRole.MANAGEMENT || currentUser.role === UserRole.EXECUTIVE) {
            options.push({ id: UserRole.MANAGEMENT, label: 'Management Portal', requiredRole: UserRole.MANAGEMENT });
        }
        
        // Executive View: Available only if user role is Executive
        if (currentUser.role === UserRole.EXECUTIVE) {
            options.push({ id: UserRole.EXECUTIVE, label: 'Executive Control Center', requiredRole: UserRole.EXECUTIVE });
        }
        
        return options; 
    }, [currentUser.role]);

    // --- 2. Link Generation Function ---
    const getLinkToView = (role: UserRole) => {
        const linkRole = role.toLowerCase();
        return `/team/${elementId}/${toolId}?view=${linkRole}`;
    }


    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">{toolId.toUpperCase()} Dashboard</h1>
            
            {/* --- Widgets Display --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <StatusWidget toolId={toolId} currentUser={currentUser} />
                <OpenItemsWidget toolId={toolId} currentUser={currentUser} />
                
                 <div className="p-5 bg-white dark:bg-gray-800 rounded-lg shadow-md border dark:border-slate-700">
                     <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">Team Announcement</h3>
                     <p className="text-sm text-gray-500 dark:text-gray-400">All team members: Complete the mandatory Q3 training by Friday.</p>
                </div>
            </div>
            
            {/* --- View Selector --- */}
            <div className="mt-8 border-b border-t border-gray-200 dark:border-gray-700 py-4">
                <nav className="flex space-x-4 items-center">
                    <span className="py-2 text-base font-semibold text-gray-800 dark:text-gray-200">Go to Full View:</span>
                    {VIEWS.map(view => (
                        <Link 
                            key={view.id} 
                            to={getLinkToView(view.requiredRole)}
                            className="px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-md hover:bg-violet-700 transition-colors"
                        >
                            {view.label}
                        </Link>
                    ))}
                </nav>
            </div>
        </div>
    );
};

export default ToolDashboardView;