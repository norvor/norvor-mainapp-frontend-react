
import React, { useState, useEffect, useRef } from 'react';
import { User, UserRole } from '../../types';
import { ActiveView, Module } from '../../App';
import { TEAM_CONFIGS, DEPARTMENT_CONFIGS, CENTRAL_CONFIGS } from '../../data/mockData';
import ChevronDownIcon from '../icons/ChevronDownIcon';

// Icons
import NorvorLogo from '../icons/NorvorLogo';
import TeamIcon from '../icons/TeamIcon';
import CrmIcon from '../icons/CrmIcon';
import PmIcon from '../icons/PmIcon';
import HrIcon from '../icons/HrIcon';
import DataLabsIcon from '../icons/DataLabsIcon';
import DocsIcon from '../icons/DocsIcon';
import XIcon from '../icons/XIcon';
import RequestsIcon from '../icons/RequestsIcon';
import OrganiserIcon from '../icons/OrganiserIcon';

const MODULE_ICONS: Record<Module, React.FC<{className?: string}>> = {
    hub: TeamIcon,
    crm: CrmIcon,
    pm: PmIcon,
    hr: HrIcon,
    docs: DocsIcon,
    datalabs: DataLabsIcon,
    requests: RequestsIcon,
    organiser: OrganiserIcon,
    'control-center': TeamIcon, 
};

const MODULE_LABELS: Record<string, string> = {
  crm: 'CRM',
  pm: 'Projects',
  docs: 'Library',
  hr: 'HR',
  hub: 'Team Hub',
  datalabs: 'Data Labs',
  requests: 'Requests',
  organiser: 'Structure',
};

const NavButton: React.FC<{
  children: React.ReactNode;
  onClick: () => void;
  isActive?: boolean;
  icon?: React.ReactNode;
  isSidebarOpen: boolean;
}> = ({ children, onClick, isActive, icon, isSidebarOpen }) => {
  return (
    <button 
      onClick={onClick}
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
    </button>
  );
};

const DropdownNavButton: React.FC<{
  module: Module;
  baseLabel: string;
  icon: React.ReactNode;
  isActive: boolean;
  isSidebarOpen: boolean;
  currentUser: User;
  activePerspective?: UserRole;
  onPerspectiveChange: (module: Module, role: UserRole) => void;
}> = ({ module, baseLabel, icon, isActive, isSidebarOpen, currentUser, activePerspective, onPerspectiveChange }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);
    
    const perspectiveLabel = activePerspective ? `(as ${activePerspective})` : '';

    const roleOptions: {label: string, role: UserRole}[] = [];
    if (currentUser.role === UserRole.EXECUTIVE) {
        roleOptions.push({label: `${UserRole.EXECUTIVE} View`, role: UserRole.EXECUTIVE});
        roleOptions.push({label: `${UserRole.MANAGEMENT} View`, role: UserRole.MANAGEMENT});
        roleOptions.push({label: `${UserRole.TEAM} View`, role: UserRole.TEAM});
    } else if (currentUser.role === UserRole.MANAGEMENT) {
        roleOptions.push({label: `${UserRole.MANAGEMENT} View`, role: UserRole.MANAGEMENT});
        roleOptions.push({label: `${UserRole.TEAM} View`, role: UserRole.TEAM});
    }

    return (
        <div className="relative" ref={wrapperRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`w-full flex items-center text-left py-2 text-sm font-medium rounded-md transition-all duration-150 group relative
                ${isSidebarOpen ? 'px-4' : 'px-3 justify-center'}
                ${isActive 
                  ? `bg-white/10 text-violet-300` 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
              title={!isSidebarOpen ? `${baseLabel}` : undefined}
            >
              {isActive && <div className="absolute left-0 top-1 bottom-1 w-1 bg-violet-400 rounded-r-full"></div>}
              {icon && <span className={`flex-shrink-0 h-5 w-5 transition-all duration-300 ${isSidebarOpen ? 'mr-3' : 'mr-0'}`}>{icon}</span>}
              {isSidebarOpen && (
                <>
                  <span className="flex-1 whitespace-nowrap">{baseLabel} <span className="text-xs text-slate-400">{perspectiveLabel}</span></span>
                  <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180': ''}`} />
                </>
              )}
            </button>
            {isDropdownOpen && isSidebarOpen && (
                <div className="mt-1 ml-8 pl-3 border-l border-slate-700 space-y-1">
                    {roleOptions.map(opt => (
                        <button key={opt.role} onClick={() => { onPerspectiveChange(module, opt.role); setIsDropdownOpen(false); }} className="w-full text-left text-xs py-1 px-2 text-slate-400 hover:text-white rounded-md">
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};


const SectionHeader: React.FC<{ title: string; isSidebarOpen: boolean; }> = ({ title, isSidebarOpen }) => {
    if (!isSidebarOpen) return <div className="h-6"></div>; // Placeholder for alignment
    return (
        <h3 className="px-4 pt-4 pb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</h3>
    );
};

interface SidebarProps {
  currentUser: User;
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  isOpen: boolean;
  onToggleSidebar: () => void;
  perspectives: {[key in string]?: UserRole};
  onPerspectiveChange: (module: Module, role: UserRole) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentUser, activeView, onNavigate, isOpen, onToggleSidebar, perspectives, onPerspectiveChange }) => {
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (activeView.id) {
            setOpenSections(prev => ({...prev, [activeView.id]: true}));
        }
    }, [activeView.id]);

    const toggleSection = (sectionId: string) => {
        setOpenSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
    };

    const userCanViewTeam = (teamId: string) => {
        return currentUser.teamIds?.includes(teamId) || currentUser.role === 'Executive';
    }

    const modulesWithPerspectives: Module[] = ['crm', 'pm', 'hr'];
    const userCanHavePerspectives = currentUser.role === UserRole.EXECUTIVE || currentUser.role === UserRole.MANAGEMENT;

  return (
    <div className={`fixed lg:relative inset-y-0 left-0 z-40 bg-gradient-to-b from-gray-900 to-slate-900 text-white flex flex-col shrink-0
                     overflow-y-auto transition-all duration-300 ease-in-out no-scrollbar
                     ${isOpen ? 'w-72' : 'w-20'} 
                     ${!isOpen && window.innerWidth < 1024 ? '-translate-x-full' : 'translate-x-0'}
                     `}>
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
        {/* Central Section */}
        <SectionHeader title="Central" isSidebarOpen={isOpen} />
        {CENTRAL_CONFIGS.map(config => (
            config.roles.includes(currentUser.role) && config.modules.map(module => {
                const Icon = MODULE_ICONS[module];
                const label = MODULE_LABELS[module] || module;
                return (
                     <NavButton
                        key={module}
                        onClick={() => onNavigate({ type: 'global', id: module, module, label })}
                        isActive={activeView.type === 'global' && activeView.module === module}
                        isSidebarOpen={isOpen}
                        icon={<Icon />}
                    >
                        {label}
                    </NavButton>
                );
            })
        ))}

        {/* Teams Section */}
        <div className="mt-4 border-t border-slate-700/50">
            <SectionHeader title="Teams" isSidebarOpen={isOpen} />
        </div>
        {TEAM_CONFIGS.filter(team => userCanViewTeam(team.id)).map(team => (
            <div key={team.id} className="mt-1">
                <NavButton
                    onClick={() => {
                        if (isOpen) toggleSection(team.id);
                        onNavigate({ type: 'team', id: team.id, module: 'hub', label: `${team.name} Hub` });
                    }}
                    isActive={activeView.type === 'team' && activeView.id === team.id}
                    isSidebarOpen={isOpen}
                    icon={<TeamIcon />}
                >
                    {team.name}
                </NavButton>
                {isOpen && openSections[team.id] && (
                    <div className="pl-6 mt-1 space-y-1 border-l border-slate-700 ml-5">
                        {team.modules.filter(m => m !== 'hub').map(module => {
                            const Icon = MODULE_ICONS[module];
                            const label = MODULE_LABELS[module] || module;
                            const showDropdown = userCanHavePerspectives && modulesWithPerspectives.includes(module);
                            const isModuleActive = activeView.id === team.id && activeView.module === module;

                            if (showDropdown) {
                                return <DropdownNavButton 
                                    key={module}
                                    module={module}
                                    baseLabel={label}
                                    icon={<Icon />}
                                    isActive={isModuleActive}
                                    isSidebarOpen={isOpen}
                                    currentUser={currentUser}
                                    activePerspective={perspectives[module]}
                                    onPerspectiveChange={onPerspectiveChange}
                                />
                            }
                            
                            return (
                                <NavButton
                                    key={module}
                                    onClick={() => onNavigate({ type: 'team', id: team.id, module: module, label: `${team.name} ${label}`})}
                                    isActive={isModuleActive}
                                    isSidebarOpen={isOpen}
                                    icon={<Icon />}
                                >
                                    {label}
                                </NavButton>
                            );
                        })}
                    </div>
                )}
            </div>
        ))}
        
        {/* Departments Section */}
        <div className="mt-4 border-t border-slate-700/50">
            <SectionHeader title="Departments" isSidebarOpen={isOpen} />
             {DEPARTMENT_CONFIGS.map(dept => (
                <div key={dept.id} className="mt-1">
                     <NavButton
                        onClick={() => isOpen && toggleSection(dept.id)}
                        isActive={activeView.type === 'department' && activeView.id === dept.id}
                        isSidebarOpen={isOpen}
                        icon={<HrIcon />}
                    >
                        {dept.name}
                    </NavButton>
                    {isOpen && openSections[dept.id] && (
                         <div className="pl-6 mt-1 space-y-1 border-l border-slate-700 ml-5">
                            {dept.modules.map(module => {
                                const Icon = MODULE_ICONS[module];
                                const label = MODULE_LABELS[module] || module;
                                const showDropdown = userCanHavePerspectives && modulesWithPerspectives.includes(module);
                                const isModuleActive = activeView.id === dept.id && activeView.module === module;

                                if (showDropdown) {
                                    return <DropdownNavButton 
                                        key={module}
                                        module={module}
                                        baseLabel={label}
                                        icon={<Icon />}
                                        isActive={isModuleActive}
                                        isSidebarOpen={isOpen}
                                        currentUser={currentUser}
                                        activePerspective={perspectives[module]}
                                        onPerspectiveChange={onPerspectiveChange}
                                    />
                                }

                                return (
                                <NavButton
                                    key={module}
                                    onClick={() => onNavigate({ type: 'department', id: dept.id, module: module, label: `${dept.name} ${label}`})}
                                    isActive={isModuleActive}
                                    isSidebarOpen={isOpen}
                                    icon={<Icon />}
                                >
                                    {label}
                                </NavButton>
                                );
                            })}
                        </div>
                    )}
                </div>
             ))}
        </div>
      </nav>
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default Sidebar;