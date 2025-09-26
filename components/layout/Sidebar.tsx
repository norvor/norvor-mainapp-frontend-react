
import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../../types';
import { ActiveView } from '../../App';
import { TEAMS } from '../../data/mockData';
import SettingsIcon from '../icons/SettingsIcon';
import ChevronDownIcon from '../icons/ChevronDownIcon';

// Helper component for navigation buttons
const NavButton: React.FC<{
  children: React.ReactNode,
  onClick: () => void,
  color?: string,
  isActive?: boolean
}> = ({ children, onClick, color = 'bg-violet-600', isActive }) => (
  <div className="px-4 py-1">
    <button 
      onClick={onClick}
      className={`w-full text-left font-semibold text-white px-4 py-2 rounded-md shadow-sm transition-all duration-200 ${color} ${isActive ? 'ring-2 ring-white ring-offset-2 ring-offset-blue-800' : 'hover:brightness-110'}`}
    >
      {children}
    </button>
  </div>
);

// Helper component for collapsible section headers
const SectionHeader: React.FC<{ title: string; isOpen: boolean; onToggle: () => void; }> = ({ title, isOpen, onToggle }) => (
    <button 
        onClick={onToggle}
        className="w-full flex items-center justify-between text-left group"
        aria-expanded={isOpen}
    >
        <div className="px-4 py-2 mt-4 flex-grow">
            <h3 className="font-bold text-white text-lg bg-violet-700 rounded-md shadow-md text-center py-2 group-hover:bg-violet-800 transition-colors">{title}</h3>
        </div>
        <ChevronDownIcon className={`w-6 h-6 text-white transition-transform duration-300 mt-4 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
    </button>
);

// Helper for the content of a collapsible section
const CollapsibleContent: React.FC<{ isOpen: boolean; children: React.ReactNode; }> = ({ isOpen, children }) => (
    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
        <div className="pt-1 pb-2">
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
            const newOpenSections: Record<string, boolean> = {};
            newOpenSections[sectionToOpen] = true;
            setOpenSections(newOpenSections);
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
    <div className="flex flex-col bg-blue-800 text-white w-72 p-4 overflow-y-auto">
      <div className="flex items-center space-x-3 pb-4 border-b border-blue-700">
        <button className="p-2 rounded-md bg-violet-800 hover:bg-violet-900">
          <SettingsIcon className="w-6 h-6 text-white"/>
        </button>
        <button className="px-4 py-2 rounded-md bg-violet-600 hover:bg-violet-700 font-semibold flex-grow text-center">
          Profile
        </button>
        <span className="font-semibold text-sm pr-2">{currentUser.role}</span>
      </div>

      <div className="flex-grow">
        {canView(UserRole.EXECUTIVE) && (
          <div>
            <SectionHeader title="Executive Area" isOpen={!!openSections.executive} onToggle={() => toggleSection('executive')} />
            <CollapsibleContent isOpen={!!openSections.executive}>
              <NavButton 
                color="bg-violet-600"
                isActive={activeView.module === 'control-center' && activeView.role === UserRole.EXECUTIVE}
                onClick={() => onNavigate({module: 'control-center', role: UserRole.EXECUTIVE, label: 'Control Center'})}>
                Control Center
              </NavButton>
               <NavButton 
                color="bg-violet-600"
                isActive={activeView.module === 'organiser'}
                onClick={() => onNavigate({module: 'organiser', role: UserRole.EXECUTIVE, label: 'Organiser'})}>
                Organiser
              </NavButton>
            </CollapsibleContent>
          </div>
        )}
        
        {canView(UserRole.MANAGEMENT) && (
          <div>
            <SectionHeader title="Management Area" isOpen={!!openSections.management} onToggle={() => toggleSection('management')} />
            <CollapsibleContent isOpen={!!openSections.management}>
             <NavButton 
              color="bg-blue-600"
              isActive={activeView.module === 'control-center' && activeView.role === UserRole.MANAGEMENT}
              onClick={() => onNavigate({module: 'control-center', role: UserRole.MANAGEMENT, label: 'Control Center'})}>
              Control Center
            </NavButton>
            </CollapsibleContent>
          </div>
        )}

        {canView(UserRole.TEAM) && (
           <div>
            <SectionHeader title="Team Area" isOpen={!!openSections.team} onToggle={() => toggleSection('team')} />
            <CollapsibleContent isOpen={!!openSections.team}>
              {TEAMS.map(team => (
                <NavButton 
                  key={team.id}
                  color="bg-turquoise-500"
                  isActive={activeView.module === 'team-dashboard' && activeView.teamId === team.id}
                  onClick={() => onNavigate({module: 'team-dashboard', role: UserRole.TEAM, teamId: team.id, label: team.name})}
                  >
                  {team.name}
                </NavButton>
              ))}
            </CollapsibleContent>
          </div>
        )}

        <div>
            <SectionHeader title="CRM" isOpen={!!openSections.crm} onToggle={() => toggleSection('crm')} />
            <CollapsibleContent isOpen={!!openSections.crm}>
              {canView(UserRole.EXECUTIVE) && <NavButton color="bg-violet-600" isActive={activeView.module === 'crm' && activeView.role === UserRole.EXECUTIVE} onClick={() => onNavigate({module: 'crm', role: UserRole.EXECUTIVE, label: 'CRM Executive'})}>Executive</NavButton>}
              {canView(UserRole.MANAGEMENT) && <NavButton color="bg-blue-600" isActive={activeView.module === 'crm' && activeView.role === UserRole.MANAGEMENT} onClick={() => onNavigate({module: 'crm', role: UserRole.MANAGEMENT, label: 'CRM Management'})}>Management</NavButton>}
              {canView(UserRole.TEAM) && <NavButton color="bg-turquoise-500" isActive={activeView.module === 'crm' && activeView.role === UserRole.TEAM} onClick={() => onNavigate({module: 'crm', role: UserRole.TEAM, label: 'CRM Team'})}>Team</NavButton>}
            </CollapsibleContent>
        </div>

        <div>
            <SectionHeader title="PM" isOpen={!!openSections.pm} onToggle={() => toggleSection('pm')} />
            <CollapsibleContent isOpen={!!openSections.pm}>
              {canView(UserRole.EXECUTIVE) && <NavButton color="bg-violet-600" isActive={activeView.module === 'pm' && activeView.role === UserRole.EXECUTIVE} onClick={() => onNavigate({module: 'pm', role: UserRole.EXECUTIVE, label: 'PM Executive'})}>Executive</NavButton>}
              {canView(UserRole.MANAGEMENT) && <NavButton color="bg-blue-600" isActive={activeView.module === 'pm' && activeView.role === UserRole.MANAGEMENT} onClick={() => onNavigate({module: 'pm', role: UserRole.MANAGEMENT, label: 'PM Management'})}>Management</NavButton>}
              {canView(UserRole.TEAM) && <NavButton color="bg-turquoise-500" isActive={activeView.module === 'pm' && activeView.role === UserRole.TEAM} onClick={() => onNavigate({module: 'pm', role: UserRole.TEAM, label: 'PM Team'})}>Team</NavButton>}
            </CollapsibleContent>
        </div>

        <div>
            <SectionHeader title="HR" isOpen={!!openSections.hr} onToggle={() => toggleSection('hr')} />
            <CollapsibleContent isOpen={!!openSections.hr}>
              {canView(UserRole.EXECUTIVE) && <NavButton color="bg-violet-600" isActive={activeView.module === 'hr' && activeView.role === UserRole.EXECUTIVE} onClick={() => onNavigate({module: 'hr', role: UserRole.EXECUTIVE, label: 'HR Executive'})}>Executive</NavButton>}
              {canView(UserRole.MANAGEMENT) && <NavButton color="bg-blue-600" isActive={activeView.module === 'hr' && activeView.role === UserRole.MANAGEMENT} onClick={() => onNavigate({module: 'hr', role: UserRole.MANAGEMENT, label: 'HR Management'})}>Management</NavButton>}
              {canView(UserRole.TEAM) && <NavButton color="bg-turquoise-500" isActive={activeView.module === 'hr' && activeView.role === UserRole.TEAM} onClick={() => onNavigate({module: 'hr', role: UserRole.TEAM, label: 'HR Team'})}>Team</NavButton>}
            </CollapsibleContent>
        </div>

        <div className="mt-4 border-t border-blue-700 pt-2">
          <NavButton isActive={activeView.module === 'datalabs'} onClick={() => onNavigate({module: 'datalabs', role: activeView.role, label: 'DataLabs'})}>
            DataLabs
          </NavButton>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
