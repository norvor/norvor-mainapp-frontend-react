import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../../types';
import { ActiveView } from '../../App';
import { TEAMS } from '../../data/mockData';
import ChevronDownIcon from '../icons/ChevronDownIcon';

// New Icons
import NorvorLogo from '../icons/NorvorLogo';
import ControlCenterIcon from '../icons/ControlCenterIcon';
// Existing Icons for Modules
import OrganiserIcon from '../icons/OrganiserIcon';
import TeamIcon from '../icons/TeamIcon';
import CrmIcon from '../icons/CrmIcon';
import PmIcon from '../icons/PmIcon';
import HrIcon from '../icons/HrIcon';
import DataLabsIcon from '../icons/DataLabsIcon';
import DocsIcon from '../icons/DocsIcon';


const NavButton: React.FC<{
  children: React.ReactNode;
  onClick: () => void;
  isActive?: boolean;
  icon?: React.ReactNode;
  activeColor?: 'violet' | 'blue' | 'turquoise' | 'gray';
}> = ({ children, onClick, isActive, icon, activeColor = 'violet' }) => {
  const activeBorderColor = {
    violet: 'border-violet-400',
    blue: 'border-blue-400',
    turquoise: 'border-turquoise-400',
    gray: 'border-slate-500'
  }[activeColor];

  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center text-left px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150 group border-l-4 ${
        isActive 
          ? `${activeBorderColor} bg-slate-800 text-white` 
          : 'border-transparent text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      {icon && <span className="mr-3 flex-shrink-0 h-5 w-5">{icon}</span>}
      <span className="flex-1">{children}</span>
    </button>
  );
};

const SectionHeader: React.FC<{ title: string; isOpen: boolean; onToggle: () => void; icon?: React.ReactNode; }> = ({ title, isOpen, onToggle, icon }) => (
    <button 
        onClick={onToggle}
        className="w-full flex items-center justify-between text-left px-4 py-2 mt-3 group"
        aria-expanded={isOpen}
    >
        <div className="flex items-center space-x-3">
            {icon && <span className="h-5 w-5 text-slate-500 group-hover:text-slate-400 transition-colors">{icon}</span>}
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider group-hover:text-slate-400 transition-colors">{title}</h3>
        </div>
        <ChevronDownIcon className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
    </button>
);

const CollapsibleContent: React.FC<{ isOpen: boolean; children: React.ReactNode; }> = ({ isOpen, children }) => (
    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
        <div className="py-1 space-y-1 pl-4">
            {children}
        </div>
    </div>
);


interface SidebarProps {
  currentUser: User;
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentUser, activeView, onNavigate }) => {
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

    // Automatically open the section that contains the active view
    useEffect(() => {
        let sectionToOpen: string | null = null;

        if (activeView.module === 'control-center' && activeView.role === UserRole.EXECUTIVE) sectionToOpen = 'executive';
        if (activeView.module === 'organiser') sectionToOpen = 'executive';
        if (activeView.module === 'control-center' && activeView.role === UserRole.MANAGEMENT) sectionToOpen = 'management';
        if (activeView.module === 'team-dashboard') sectionToOpen = 'team';
        if (activeView.module === 'crm') sectionToOpen = 'crm';
        if (activeView.module === 'pm') sectionToOpen = 'pm';
        if (activeView.module === 'hr') sectionToOpen = 'hr';


        if (sectionToOpen) {
            setOpenSections(prev => ({...prev, [sectionToOpen]: true}));
        }
    }, [activeView]);

    const toggleSection = (section: string) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

  const canView = (role: UserRole) => {
    if (currentUser.role === UserRole.EXECUTIVE) return true;
    if (currentUser.role === UserRole.MANAGEMENT) return role === UserRole.MANAGEMENT || role === UserRole.TEAM;
    if (currentUser.role === UserRole.TEAM) return role === UserRole.TEAM;
    return false;
  }

  return (
    <div className="flex flex-col bg-slate-900 text-white w-72 overflow-y-auto">
      <div className="flex items-center space-x-3 px-4 py-5 border-b border-slate-700/50">
        <NorvorLogo className="w-8 h-8 text-violet-400"/>
        <h1 className="text-xl font-bold text-white tracking-tight">Norvor CRM</h1>
      </div>

      <div className="flex-grow px-3 py-4">
        {canView(UserRole.EXECUTIVE) && (
          <div>
            <SectionHeader title="Strategic" isOpen={!!openSections.executive} onToggle={() => toggleSection('executive')} />
            <CollapsibleContent isOpen={!!openSections.executive}>
              <NavButton 
                activeColor="violet"
                isActive={activeView.module === 'control-center' && activeView.role === UserRole.EXECUTIVE}
                onClick={() => onNavigate({module: 'control-center', role: UserRole.EXECUTIVE, label: 'Control Center'})}
                icon={<ControlCenterIcon />}>
                Control Center
              </NavButton>
               <NavButton 
                activeColor="violet"
                isActive={activeView.module === 'organiser'}
                onClick={() => onNavigate({module: 'organiser', role: UserRole.EXECUTIVE, label: 'Organiser'})}
                icon={<OrganiserIcon />}>
                Organiser
              </NavButton>
            </CollapsibleContent>
          </div>
        )}
        
        {canView(UserRole.MANAGEMENT) && (
          <div>
            <SectionHeader title="Management" isOpen={!!openSections.management} onToggle={() => toggleSection('management')} />
            <CollapsibleContent isOpen={!!openSections.management}>
             <NavButton 
              activeColor="blue"
              isActive={activeView.module === 'control-center' && activeView.role === UserRole.MANAGEMENT}
              onClick={() => onNavigate({module: 'control-center', role: UserRole.MANAGEMENT, label: 'Control Center'})}
              icon={<ControlCenterIcon />}>
              Control Center
            </NavButton>
            </CollapsibleContent>
          </div>
        )}

        {canView(UserRole.TEAM) && (
           <div>
            <SectionHeader title="Team Hubs" isOpen={!!openSections.team} onToggle={() => toggleSection('team')} />
            <CollapsibleContent isOpen={!!openSections.team}>
              {TEAMS.map(team => (
                <NavButton 
                  key={team.id}
                  activeColor="turquoise"
                  isActive={activeView.module === 'team-dashboard' && activeView.teamId === team.id}
                  onClick={() => onNavigate({module: 'team-dashboard', role: UserRole.TEAM, teamId: team.id, label: team.name})}
                  icon={<TeamIcon />}
                  >
                  {team.name}
                </NavButton>
              ))}
            </CollapsibleContent>
          </div>
        )}

        <div>
            <SectionHeader title="CRM" icon={<CrmIcon />} isOpen={!!openSections.crm} onToggle={() => toggleSection('crm')} />
            <CollapsibleContent isOpen={!!openSections.crm}>
              {canView(UserRole.EXECUTIVE) && <NavButton activeColor="violet" isActive={activeView.module === 'crm' && activeView.role === UserRole.EXECUTIVE} onClick={() => onNavigate({module: 'crm', role: UserRole.EXECUTIVE, label: 'CRM Executive'})}>Executive</NavButton>}
              {canView(UserRole.MANAGEMENT) && <NavButton activeColor="blue" isActive={activeView.module === 'crm' && activeView.role === UserRole.MANAGEMENT} onClick={() => onNavigate({module: 'crm', role: UserRole.MANAGEMENT, label: 'CRM Management'})}>Management</NavButton>}
              {canView(UserRole.TEAM) && <NavButton activeColor="turquoise" isActive={activeView.module === 'crm' && activeView.role === UserRole.TEAM} onClick={() => onNavigate({module: 'crm', role: UserRole.TEAM, label: 'CRM Team'})}>Team</NavButton>}
            </CollapsibleContent>
        </div>

        <div>
            <SectionHeader title="PM" icon={<PmIcon />} isOpen={!!openSections.pm} onToggle={() => toggleSection('pm')} />
            <CollapsibleContent isOpen={!!openSections.pm}>
              {canView(UserRole.EXECUTIVE) && <NavButton activeColor="violet" isActive={activeView.module === 'pm' && activeView.role === UserRole.EXECUTIVE} onClick={() => onNavigate({module: 'pm', role: UserRole.EXECUTIVE, label: 'PM Executive'})}>Executive</NavButton>}
              {canView(UserRole.MANAGEMENT) && <NavButton activeColor="blue" isActive={activeView.module === 'pm' && activeView.role === UserRole.MANAGEMENT} onClick={() => onNavigate({module: 'pm', role: UserRole.MANAGEMENT, label: 'PM Management'})}>Management</NavButton>}
              {canView(UserRole.TEAM) && <NavButton activeColor="turquoise" isActive={activeView.module === 'pm' && activeView.role === UserRole.TEAM} onClick={() => onNavigate({module: 'pm', role: UserRole.TEAM, label: 'PM Team'})}>Team</NavButton>}
            </CollapsibleContent>
        </div>

        <div>
            <SectionHeader title="HR" icon={<HrIcon />} isOpen={!!openSections.hr} onToggle={() => toggleSection('hr')} />
            <CollapsibleContent isOpen={!!openSections.hr}>
              {canView(UserRole.EXECUTIVE) && <NavButton activeColor="violet" isActive={activeView.module === 'hr' && activeView.role === UserRole.EXECUTIVE} onClick={() => onNavigate({module: 'hr', role: UserRole.EXECUTIVE, label: 'HR Executive'})}>Executive</NavButton>}
              {canView(UserRole.MANAGEMENT) && <NavButton activeColor="blue" isActive={activeView.module === 'hr' && activeView.role === UserRole.MANAGEMENT} onClick={() => onNavigate({module: 'hr', role: UserRole.MANAGEMENT, label: 'HR Management'})}>Management</NavButton>}
              {canView(UserRole.TEAM) && <NavButton activeColor="turquoise" isActive={activeView.module === 'hr' && activeView.role === UserRole.TEAM} onClick={() => onNavigate({module: 'hr', role: UserRole.TEAM, label: 'HR Team'})}>Team</NavButton>}
            </CollapsibleContent>
        </div>

        <div className="mt-4 border-t border-slate-700/50 pt-4 space-y-1">
          <NavButton activeColor="gray" isActive={activeView.module === 'datalabs'} onClick={() => onNavigate({module: 'datalabs', role: activeView.role, label: 'DataLabs'})} icon={<DataLabsIcon />}>
            DataLabs
          </NavButton>
          <NavButton activeColor="gray" isActive={activeView.module === 'docs'} onClick={() => onNavigate({module: 'docs', role: activeView.role, label: 'Docs'})} icon={<DocsIcon />}>
            Docs
          </NavButton>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
