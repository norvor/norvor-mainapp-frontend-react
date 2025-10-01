
import React, { memo } from 'react';

const DepartmentIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h6M9 11.25h6M9 15.75h6M4.5 21v-3.375c0-.621.504-1.125 1.125-1.125h12.75c.621 0 1.125.504 1.125 1.125V21" />
    </svg>
);

export default memo(DepartmentIcon);
