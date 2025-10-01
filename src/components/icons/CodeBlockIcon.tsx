import React, { memo } from 'react';

const CodeBlockIcon: React.FC<{className?: string}> = ({className="w-5 h-5"}) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 20l4-16m4 12l4-4-4-4M6 8l-4 4 4 4"/>
    </svg>
);

export default memo(CodeBlockIcon);
