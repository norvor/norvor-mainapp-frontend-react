import React, { useState, useRef, useEffect } from 'react';
import { UserRole } from '../../types';
import ChevronDownIcon from '../icons/ChevronDownIcon';

interface PerspectiveSwitcherProps {
  currentUserRole: UserRole;
  currentModule: string;
  activePerspective: UserRole;
  onPerspectiveChange: (perspective: UserRole) => void;
}

const PerspectiveSwitcher: React.FC<PerspectiveSwitcherProps> = ({
  currentUserRole,
  currentModule,
  activePerspective,
  onPerspectiveChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const availableRoles: UserRole[] = [];
  if (currentUserRole === UserRole.EXECUTIVE) {
    availableRoles.push(UserRole.EXECUTIVE, UserRole.MANAGEMENT, UserRole.TEAM);
  } else if (currentUserRole === UserRole.MANAGEMENT) {
    availableRoles.push(UserRole.MANAGEMENT, UserRole.TEAM);
  }

  // If the user has no alternative views, don't render the component
  if (availableRoles.length <= 1) {
    return null;
  }
  
  // Don't show the switcher for modules that don't have role-specific views
  const modulesWithPerspectives = ['crm', 'pm', 'hr'];
  if (!modulesWithPerspectives.includes(currentModule)) {
      return null;
  }


  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [wrapperRef]);

  const handleSelect = (role: UserRole) => {
    onPerspectiveChange(role);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600 rounded-md hover:bg-gray-50 dark:hover:bg-slate-700"
      >
        <span>Viewing as: <strong>{activePerspective}</strong></span>
        <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg border dark:border-slate-700 z-50">
          <div className="py-1">
            {availableRoles.map((role) => (
              <button
                key={role}
                onClick={() => handleSelect(role)}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                {role} View
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PerspectiveSwitcher;