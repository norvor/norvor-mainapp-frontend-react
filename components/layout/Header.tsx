import React from 'react';
import { User, UserRole } from '../../types';
import SearchIcon from '../icons/SearchIcon';
import BellIcon from '../icons/BellIcon';
import ChevronDownIcon from '../icons/ChevronDownIcon';

interface HeaderProps {
  user: User;
}

const Header: React.FC<HeaderProps> = ({ user }) => {
  return (
    <header className="flex items-center justify-between h-16 bg-white border-b border-gray-200 px-6">
      {/* Search Bar */}
      <div className="flex items-center">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Global Search..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-violet-500 focus:border-violet-500 sm:text-sm"
          />
        </div>
      </div>

      {/* Right Side Icons & User Menu */}
      <div className="flex items-center space-x-5">
        <div className="relative">
          <BellIcon className="h-6 w-6 text-gray-500 hover:text-gray-700" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        </div>

        <div className="relative">
          <div className="flex items-center space-x-3 cursor-pointer">
            <img className="h-9 w-9 rounded-full object-cover" src={user.avatar} alt="User Avatar" />
            <div className="hidden md:block">
              <div className="text-sm font-semibold text-gray-800">{user.name}</div>
              <div className="text-xs text-gray-500">{user.role}</div>
            </div>
            <ChevronDownIcon className="h-4 w-4 text-gray-500 hidden md:block" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;