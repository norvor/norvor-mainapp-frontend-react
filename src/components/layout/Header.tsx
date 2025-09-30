import React from 'react';
import { User } from '../../types';
import SearchIcon from '../icons/SearchIcon';
import BellIcon from '../icons/BellIcon';
import ChevronDownIcon from '../icons/ChevronDownIcon';
import HamburgerIcon from '../icons/HamburgerIcon';
import { useTheme } from '../../contexts/ThemeContext';
import SunIcon from '../icons/SunIcon';
import MoonIcon from '../icons/MoonIcon';

interface HeaderProps {
  user: User;
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onToggleSidebar }) => {
  const { theme, toggleTheme } = useTheme();

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.onerror = null; // prevents infinite looping
    e.currentTarget.src = 'https://placehold.co/36x36/cccccc/333333?text=AV'; // Placeholder for 36x36
  };

  return (
    <header className="flex items-center justify-between h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 shrink-0">
      {/* Search Bar & Toggle */}
      <div className="flex items-center">
        <button 
          onClick={onToggleSidebar} 
          className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white -ml-2 mr-2 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-violet-500 lg:mr-4"
          aria-label="Toggle sidebar"
        >
          <HamburgerIcon className="h-6 w-6" />
        </button>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Global Search..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-violet-500 focus:border-violet-500 sm:text-sm"
          />
        </div>
      </div>

      {/* Right Side Icons & User Menu */}
      <div className="flex items-center space-x-5">
        <button 
            onClick={toggleTheme} 
            className="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Toggle dark mode"
        >
            {theme === 'light' ? <MoonIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6" />}
        </button>
        <div className="relative">
          <BellIcon className="h-6 w-6 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        </div>

        <div className="relative">
          <div className="flex items-center space-x-3 cursor-pointer">
            {/* --- EDITS APPLIED HERE --- */}
            <img 
              className="h-9 w-9 rounded-full object-cover" 
              src={user.avatar || 'https://placehold.co/36x36/cccccc/333333?text=AV'} 
              alt="User Avatar" 
              onError={handleError}
            />
            {/* --------------------------- */}
            <div className="hidden md:block">
              <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">{user.name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{user.role}</div>
            </div>
            <ChevronDownIcon className="h-4 w-4 text-gray-500 dark:text-gray-400 hidden md:block" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
