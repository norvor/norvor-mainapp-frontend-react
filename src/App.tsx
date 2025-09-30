import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Routes, Route, useParams, Navigate, useLocation } from 'react-router-dom';
import { UserRole, User, Module } from './types';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import CrmView from './views/crm/CrmView';
import PmView from './views/pm/PmView'; // Keeping PmView for structural consistency
import HrView from './views/hr/HrView';
import OrganiserView from './views/organiser/OrganiserView';
import TeamHubView from './views/teamhub/TeamHubView';
import DocsView from './views/docs/DocsView';
import RequestsView from './views/requests/RequestsView';
import { ThemeProvider } from './contexts/ThemeContext';
import DashboardView from './views/dashboard/DashboardView';
import SocialView from './views/social/SocialView';
import SettingsView from './views/settings/SettingsView';
import OnboardingView from './views/onboarding/OnboardingView';
import ProjectsView from './views/projects/ProjectsView';
import ToolDashboardView from './views/tools/ToolDashboardView';
import apiClient from './utils/apiClient';

// Redux Imports
import { fetchOrganiserElements } from './store/slices/organiserSlice';
import { fetchTickets } from './store/slices/ticketSlice';
import { RootState, AppDispatch } from './store/store';
import { fetchActivities } from './store/slices/activitySlice';
import { fetchUsers, fetchCurrentUser } from './store/slices/userSlice';
import { fetchContacts } from './store/slices/contactSlice';
import { fetchDeals } from './store/slices/dealSlice';
import { fetchProjects } from './store/slices/projectSlice';
import { fetchTasks } from './store/slices/taskSlice';
import { fetchTimeOffRequests } from './store/slices/timeOffRequestSlice';
import { fetchSidebarConfig } from './store/slices/sidebarSlice';


const TeamModuleRenderer = () => {
    const { teamId: elementId, module } = useParams<{ teamId: string; module: string }>(); 
    const location = useLocation();
    
    // Global State Selectors
    const { currentUser, users } = useSelector((state: RootState) => state.users);
    const { organiserElements } = useSelector((state: RootState) => state.organiserElements);
    const { contacts } = useSelector((state: RootState) => state.contacts);
    const { deals } = useSelector((state: RootState) => state.deals);
    const { projects } = useSelector((state: RootState) => state.projects);
    const { tasks } = useSelector((state: RootState) => state.tasks);
    const { tickets } = useSelector((state: RootState) => state.tickets);
    const { activities } = useSelector((state: RootState) => state.activities);
    const { timeOffRequests } = useSelector((state: RootState) => state.timeOffRequests);
    const dispatch: AppDispatch = useDispatch();

    // --- Dynamic Filters: Get Members from Organiser Element ---
    const activeTeamMembers = useMemo(() => {
        if (!elementId || !users || !organiserElements) return [];
        
        const targetElement = organiserElements.find(el => el.id === elementId);
        if (!targetElement) return [];
        
        const memberData = (targetElement.properties.members || []) as { userId: string }[];
        const memberIds = memberData.map(m => m.userId);

        return users.filter(user => memberIds.includes(user.id));
    }, [users, organiserElements, elementId]);

    // --- Data filtered to the current team/module context ---
    const unassignedContacts = useMemo(() => contacts.filter(c => !c.ownerId), [contacts]);
    const allTeamContacts = useMemo(() => contacts, [contacts]);
    const allTeamDeals = useMemo(() => deals, [deals]);
    const allProjects = useMemo(() => projects, [projects]);
    const allTasks = useMemo(() => tasks, [tasks]);
    const activeTeamTickets = useMemo(() => tickets.filter(t => t.teamId === elementId), [tickets, elementId]);
    
    // --- Contextual User (Forces Role if ?view= is present in URL) ---
    const contextualUser = useMemo(() => {
        if (!currentUser) return null;

        const urlParams = new URLSearchParams(location.search);
        const forcedView = urlParams.get('view');
        
        if (forcedView) {
            const forcedRole = forcedView.charAt(0).toUpperCase() + forcedView.slice(1);
            if (Object.values(UserRole).includes(forcedRole as UserRole)) {
                return { ...currentUser, role: forcedRole as UserRole };
            }
        }
        
        return currentUser;

    }, [currentUser, location.search]);
    // -----------------------------------------------------------

    if (!elementId) {
        return <Navigate to="/dashboard" />;
    }

    if (!currentUser || !contextualUser) return null;

    // FIX: Simplified switch logic. The individual view components now handle the dashboard logic.
    switch (module) {
        case 'hub':
            // Renders the main Team Roster view
            return <TeamHubView elementId={elementId} tickets={activeTeamTickets} teamMembers={activeTeamMembers} projects={allProjects} />;
        
        case 'docs':
            return <DocsView currentUser={contextualUser} />;

        case 'requests':
            return <RequestsView teamId={elementId!} tickets={activeTeamTickets} allUsers={users} currentUser={contextualUser} />;
        
        // --- MAIN TOOL VIEW ROUTES (These match the module IDs in your sidebar config) ---
        case 'crm':
            // CrmView needs to be updated to check for ?view= or default to the Dashboard View
            return <CrmView 
                viewingUser={contextualUser} 
                teamMembers={activeTeamMembers} 
                contacts={contacts} 
                deals={deals} 
                activities={activities} 
                unassignedContacts={unassignedContacts} 
                allTeamContacts={allTeamContacts} 
                allTeamDeals={allTeamDeals} 
                refetchData={() => dispatch(fetchContacts())} 
            />;
        case 'pm':
            // ProjectsView now handles its own internal dashboard/view selection
            return <ProjectsView 
                viewingUser={contextualUser} 
                allUsers={users} 
                projects={allProjects} 
                tasks={allTasks} 
                teamMembers={activeTeamMembers} 
            />;
        case 'hr':
             // HrView needs to be updated to check for ?view= or default to the Dashboard View
             return <HrView 
                viewingUser={contextualUser} 
                allUsers={users} 
                timeOffRequests={timeOffRequests} 
                directReports={activeTeamMembers.filter(m => m.managerId === contextualUser.id)}
             />;
        // ---------------------------------------------------------------------

        default:
            // Final Fallback: if the module is unrecognized, show the Hub.
            return <TeamHubView elementId={elementId} tickets={activeTeamTickets} teamMembers={activeTeamMembers} projects={allProjects} />;
    }
};


const App: React.FC = () => {
    // ... (App component initialization remains unchanged)
    const dispatch: AppDispatch = useDispatch();
    const location = useLocation();

    const { currentUser, users, loading: usersLoading, error: usersError } = useSelector((state: RootState) => state.users);
    const { organiserElements } = useSelector((state: RootState) => state.organiserElements);
    
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
    
    useEffect(() => {
        if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
        }
    }, [location.pathname]);

    useEffect(() => {
        let currentToken = localStorage.getItem('authToken');
        const urlParams = new URLSearchParams(window.location.search);
        const tokenFromUrl = urlParams.get('token');
        if (tokenFromUrl) {
        localStorage.setItem('authToken', tokenFromUrl);
        currentToken = tokenFromUrl;
        window.history.replaceState({}, document.title, window.location.pathname);
        }
        if (!currentToken) {
        window.location.href = 'http://localhost:3000/login';
        //window.location.href = 'https://www.norvorx.com/login';
        return;
        }
        dispatch(fetchSidebarConfig());
        dispatch(fetchCurrentUser());
        dispatch(fetchUsers());
        dispatch(fetchContacts());
        dispatch(fetchDeals());
        dispatch(fetchProjects());
        dispatch(fetchTasks());
        dispatch(fetchActivities());
        dispatch(fetchTimeOffRequests());
        dispatch(fetchOrganiserElements());
        dispatch(fetchTickets());
    }, [dispatch]);

    const handleResize = useCallback(() => {
        setIsSidebarOpen(window.innerWidth >= 1024);
    }, []);

    useEffect(() => {
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [handleResize]);

    const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
    
    const handleOnboardingComplete = async () => {
        try {
        await apiClient('/organizations/complete_onboarding', { method: 'POST' });
        dispatch(fetchCurrentUser());
        } catch (err) {
        console.error("Failed to complete onboarding:", err);
        }
    };

    if (usersLoading || !currentUser) {
        return <div className="p-8 bg-gray-100 dark:bg-slate-900 text-gray-800 dark:text-gray-200 h-screen flex items-center justify-center">Loading Application...</div>;
    }
    if (usersError) {
        return <div className="p-8 bg-gray-100 dark:bg-slate-900 text-red-500 h-screen flex items-center justify-center">Error: {usersError}</div>;
    }
    
    if (currentUser.role === UserRole.EXECUTIVE && !currentUser.organization?.has_completed_onboarding) {
        return <OnboardingView currentUser={currentUser} onOnboardingComplete={handleOnboardingComplete} />;
    }

    return (
        <ThemeProvider>
        <div className="relative flex h-screen bg-gray-100 dark:bg-slate-900 text-gray-800 dark:text-gray-200">
            <Sidebar currentUser={currentUser} isOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />
            <div className="flex-1 flex flex-col overflow-hidden">
            <Header user={currentUser} onToggleSidebar={toggleSidebar} />
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-slate-900 p-6 lg:p-8">
                <Routes>
                <Route path="/" element={<Navigate to="/dashboard" />} />
                <Route path="/dashboard" element={<DashboardView />} />
                <Route path="/social" element={<SocialView />} />
                <Route path="/docs" element={<DocsView />} />
                <Route path="/organiser" element={<OrganiserView />} />
                <Route path="/settings" element={<SettingsView />} />
                <Route path="/team/:teamId/:module" element={<TeamModuleRenderer />} />
                <Route path="/dept/:deptId/:module" element={<TeamModuleRenderer />} />
                </Routes>
            </main>
            </div>
        </div>
        </ThemeProvider>
    );
};

export default App;