import React from 'react';

const NorvorLogo: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 80L20 20L80 80L80 20" stroke="currentColor" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

export default NorvorLogo;
