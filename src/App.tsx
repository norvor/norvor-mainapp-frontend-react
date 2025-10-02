import React, { useState, useMemo, useEffect, useCallback, lazy, Suspense } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Routes, Route, useParams, Navigate, useLocation } from 'react-router-dom';
import { UserRole, User } from './types';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import { ThemeProvider } from './contexts/ThemeContext';
import apiClient from './utils/apiClient';

// Redux Imports
import { fetchTickets } from './store/slices/ticketSlice';
import { RootState, AppDispatch } from './store/store';
import { fetchCompanies } from './store/slices/companySlice';
import { fetchActivities } from './store/slices/activitySlice';
import { fetchUsers, fetchCurrentUser } from './store/slices/userSlice';
import { fetchContacts } from './store/slices/contactSlice';
import { fetchCrmTasks } from './store/slices/crmTaskSlice';
import { fetchDeals } from './store/slices/dealSlice';
import { fetchProjects } from './store/slices/projectSlice';
import { fetchTasks } from './store/slices/taskSlice';
import { fetchTimeOffRequests } from './store/slices/timeOffRequestSlice';
import { fetchTeams } from './store/slices/teamSlice';
import { fetchOrganiserElements } from './store/slices/organiserSlice';

// --- Lazy Loaded View Components ---
import NotificationPopup from './components/common/NotificationPopup'; // Import the new component
const CrmView = lazy(() => import('./views/crm/CrmView'));
const HrView = lazy(() => import('./views/hr/HrView'));
const OrganiserView = lazy(() => import('./views/organiser/OrganiserView'));
const TeamHubView = lazy(() => import('./views/teamhub/TeamHubView'));
const DocsView = lazy(() => import('./views/docs/DocsView'));
const RequestsView = lazy(() => import('./views/requests/RequestsView'));
const DashboardView = lazy(() => import('./views/dashboard/DashboardView'));
const SocialView = lazy(() => import('./views/social/SocialView'));
const SettingsView = lazy(() => import('./views/settings/SettingsView'));
const OnboardingView = lazy(() => import('./views/onboarding/OnboardingView'));
const ProjectsView = lazy(() => import('./views/projects/ProjectsView'));
// ------------------------------------


const TeamModuleRenderer = () => {
    const { teamId: elementId, module } = useParams<{ teamId: string; module: string }>();
    const location = useLocation();

    const { currentUser, users } = useSelector((state: RootState) => state.users);
    const { organiserElements } = useSelector((state: RootState) => state.organiserElements);
    const dispatch: AppDispatch = useDispatch();

    const activeTeamMembers = useMemo(() => {
        if (!elementId || !users || !organiserElements) return [];
        
        const targetElement = organiserElements.find(el => el.id === elementId);
        if (!targetElement) return [];
        
        const memberData = (targetElement.properties.members || []) as { userId: string }[];
        const memberIds = memberData.map(m => m.userId);

        return users.filter(user => memberIds.includes(user.id));
    }, [users, organiserElements, elementId]);

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

    if (!elementId) {
        return <Navigate to="/dashboard" />;
    }

    if (!currentUser || !contextualUser) return null;

    switch (module) {
        case 'hub':
            return <TeamHubView elementId={elementId} teamMembers={activeTeamMembers} />;
        
        case 'docs':
            return <DocsView />;

        case 'requests':
            return <RequestsView teamId={elementId} currentUser={contextualUser} />;
        
        case 'crm':
            return <CrmView 
                viewingUser={contextualUser} 
                teamMembers={activeTeamMembers} 
                refetchData={() => dispatch(fetchContacts())}
            />;
        case 'pm':
            return <ProjectsView 
                viewingUser={contextualUser} 
                teamMembers={activeTeamMembers} 
            />;
        case 'hr':
             return <HrView 
                viewingUser={contextualUser} 
                directReports={users.filter(u => u.managerId === contextualUser.id)}
             />;

        default:
            return <TeamHubView elementId={elementId} teamMembers={activeTeamMembers} />;
    }
};


const App: React.FC = () => {
    const dispatch: AppDispatch = useDispatch();
    const location = useLocation();

    const { currentUser, loading: usersLoading, error: usersError } = useSelector((state: RootState) => state.users);
    
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
        //window.location.href = 'https://app.norvorx.com/login';
        return;
        }
        dispatch(fetchTeams());
        dispatch(fetchCurrentUser());
        dispatch(fetchUsers());
        dispatch(fetchContacts());
        dispatch(fetchDeals());
        dispatch(fetchCompanies());
        dispatch(fetchProjects());
        dispatch(fetchTasks());
        dispatch(fetchCrmTasks()); 
        dispatch(fetchActivities());
        dispatch(fetchTimeOffRequests());
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
        return <OnboardingView onOnboardingComplete={handleOnboardingComplete} />;
    }

    const loadingFallback = (
        <div className="flex h-full w-full items-center justify-center">
            <p>Loading page...</p>
        </div>
    );

    return (
        <ThemeProvider>
        <div className="relative flex h-screen bg-gray-100 dark:bg-slate-900 text-gray-800 dark:text-gray-200">
            <Sidebar currentUser={currentUser} isOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />
            <div className="flex-1 flex flex-col overflow-hidden">
            <Header user={currentUser} onToggleSidebar={toggleSidebar} />
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-slate-900 p-6 lg:p-8">
                <Suspense fallback={loadingFallback}>
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
                </Suspense>
            </main>
            </div>
            <NotificationPopup />
        </div>
        </ThemeProvider>
    );
};

export default App;