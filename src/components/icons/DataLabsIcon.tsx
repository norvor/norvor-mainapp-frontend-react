
import React from 'react';

const DataLabsIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.66.537-1.197 1.197-1.197h.006c.66 0 1.197.537 1.197 1.197v7.518a2.25 2.25 0 0 1-.659 1.591l-4.502 4.502a2.25 2.25 0 0 1-3.182 0l-4.502-4.502a2.25 2.25 0 0 1-.659-1.591V6.087c0-.66.537-1.197 1.197-1.197h.006c.66 0 1.197.537 1.197 1.197v5.253a.75.75 0 0 0 .75.75h3a.75.75 0 0 0 .75-.75V6.087Z" />
    </svg>
);

export default DataLabsIcon;
