import React from 'react';

const BulletListIcon: React.FC<{className?: string}> = ({className="w-5 h-5"}) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 6h12M8 12h12M8 18h12M4 6.5a.5.5 0 100-1 .5.5 0 000 1zM4 12.5a.5.5 0 100-1 .5.5 0 000 1zM4 18.5a.5.5 0 100-1 .5.5 0 000 1z"/>
    </svg>
);

export default BulletListIcon;
