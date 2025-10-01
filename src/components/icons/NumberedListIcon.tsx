import React, { memo } from 'react';

const NumberedListIcon: React.FC<{className?: string}> = ({className="w-5 h-5"}) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 6h12M8 12h12M8 18h12M4 6h1v4M4 12h1.5a.5.5 0 00.5-.5V10a.5.5 0 00-.5-.5H4v3zM4.5 16H6v2H4v-1.5a.5.5 0 01.5-.5z"/>
    </svg>
);

export default memo(NumberedListIcon);
