import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { User, UserRole, Module } from '../../types';
import ChevronDownIcon from '../icons/ChevronDownIcon';

// Icons
import NorvorLogo from '../icons/NorvorLogo';
import TeamIcon from '../icons/TeamIcon';
import CrmIcon from '../icons/CrmIcon';
import PmIcon from '../icons/PmIcon';
import HrIcon from '../icons/HrIcon';
import DocsIcon from '../icons/DocsIcon';
import XIcon from '../icons/XIcon';
import OrganiserIcon from '../icons/OrganiserIcon';
import DashboardIcon from '../icons/DashboardIcon';
import SocialIcon from '../icons/SocialIcon';
import SettingsIcon from '../icons/SettingsIcon';

const MODULE_ICONS: { [key: string]: React.FC<{className?: string}> } = {
    dashboard: DashboardIcon,
    social: SocialIcon,
    organiser: OrganiserIcon,
    settings: SettingsIcon,
    hub: TeamIcon,
    crm: CrmIcon,
    pm: PmIcon,
    docs: DocsIcon,
    hr: HrIcon,
};

const NavButton: React.FC<{
  children: React.ReactNode;
  to: string;
  isActive?: boolean;
  icon?: React.ReactNode;
  isSidebarOpen: boolean;
}> = ({ children, to, isActive, icon, isSidebarOpen }) => {
  return (
    <Link 
      to={to}
      className={`w-full flex items-center text-left py-2 text-sm font-medium rounded-md transition-all duration-150 group relative
        ${isSidebarOpen ? 'px-4' : 'px-3 justify-center'}
        ${isActive 
          ? `bg-white/10 text-violet-300` 
          : 'text-slate-400 hover:bg-white/5 hover:text-white'
      }`}
      title={!isSidebarOpen ? String(children) : undefined}
    >
      {isActive && <div className="absolute left-0 top-1 bottom-1 w-1 bg-violet-400 rounded-r-full"></div>}
      {icon && <span className={`flex-shrink-0 h-5 w-5 transition-all duration-300 ${isSidebarOpen ? 'mr-3' : 'mr-0'}`}>{icon}</span>}
      {isSidebarOpen && <span className="flex-1 whitespace-nowrap">{children}</span>}
    </Link>
  );
};

const SectionHeader: React.FC<{ title: string; isSidebarOpen: boolean; }> = ({ title, isSidebarOpen }) => {
    if (!isSidebarOpen) return <div className="h-6"></div>;
    return (
        <h3 className="px-4 pt-4 pb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</h3>
    );
};

interface SidebarProps {
  currentUser: User;
  isOpen: boolean;
  onToggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentUser, isOpen, onToggleSidebar }) => {
    const location = useLocation();
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
    
    const { config: sidebarConfig, loading: sidebarLoading } = useSelector((state: RootState) => state.sidebar);

    useEffect(() => {
        const pathParts = location.pathname.split('/');
        if (pathParts[1] === 'team' || pathParts[1] === 'dept') {
             setOpenSections(prev => ({...prev, [pathParts[2]]: true}));
        }
    }, [location.pathname]);

    const toggleSection = (sectionId: string) => {
        setOpenSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
    };

  return (
    <div className={`fixed lg:relative inset-y-0 left-0 z-40 bg-gradient-to-b from-gray-900 to-slate-900 text-white flex flex-col shrink-0
                     overflow-y-auto transition-all duration-300 ease-in-out no-scrollbar
                     ${isOpen ? 'w-72' : 'w-20'} 
                     ${!isOpen ? '-translate-x-full' : 'translate-x-0'} lg:translate-x-0`}>
      <div className={`flex items-center justify-between space-x-3 px-4 py-5 border-b border-slate-700/50 h-16 box-border shrink-0 ${!isOpen && 'lg:justify-center'}`}>
        <div className="flex items-center space-x-3">
            <NorvorLogo className="w-8 h-8 text-violet-400 shrink-0"/>
            {isOpen && <h1 className="text-xl font-bold text-white tracking-tight whitespace-nowrap">Norvor</h1>}
        </div>
        <button onClick={onToggleSidebar} className="p-1 lg:hidden text-slate-400 hover:text-white" aria-label="Close sidebar">
            <XIcon className="w-6 h-6" />
        </button>
      </div>

      <nav className="flex-grow py-4 px-3">
        <SectionHeader title="Central" isSidebarOpen={isOpen} />
        <NavButton to="/dashboard" isActive={location.pathname.startsWith('/dashboard')} isSidebarOpen={isOpen} icon={<DashboardIcon />}>Dashboard</NavButton>
        <NavButton to="/social" isActive={location.pathname.startsWith('/social')} isSidebarOpen={isOpen} icon={<SocialIcon />}>Social</NavButton>
        {currentUser.role === UserRole.EXECUTIVE && (
            <NavButton to="/organiser" isActive={location.pathname.startsWith('/organiser')} isSidebarOpen={isOpen} icon={<OrganiserIcon />}>Structure</NavButton>
        )}
        <NavButton to="/settings" isActive={location.pathname.startsWith('/settings')} isSidebarOpen={isOpen} icon={<SettingsIcon />}>Settings</NavButton>
        
        {sidebarConfig && sidebarConfig.groups.map(group => (
            <div key={group.title} className="mt-4 border-t border-slate-700/50">
                <SectionHeader title={group.title} isSidebarOpen={isOpen} />
                {group.items.map(item => {
                    const Icon = group.title === 'Teams' ? TeamIcon : HrIcon;
                    const basePath = group.title === 'Teams' ? 'team' : 'dept';
                    return (
                        <div key={item.id} className="mt-1">
                            <div onClick={() => toggleSection(item.id)}>
                                <NavButton
                                    to={`/${basePath}/${item.id}/${item.modules[0]?.id || 'hub'}`}
                                    isActive={location.pathname.includes(`/${basePath}/${item.id}`)}
                                    isSidebarOpen={isOpen}
                                    icon={<Icon />}
                                >
                                    {item.name}
                                </NavButton>
                            </div>
                            {isOpen && openSections[item.id] && (
                                <div className="pl-6 mt-1 space-y-1 border-l border-slate-700 ml-5">
                                    {item.modules.map(module => {
                                        const ModuleIcon = MODULE_ICONS[module.id] || DocsIcon;
                                        return (
                                            <NavButton
                                                key={module.id}
                                                to={`/${basePath}/${item.id}/${module.id}`}
                                                isActive={location.pathname === `/${basePath}/${item.id}/${module.id}`}
                                                isSidebarOpen={isOpen}
                                                icon={<ModuleIcon />}
                                            >
                                                {module.name}
                                            </NavButton>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        ))}
      </nav>
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default Sidebar;