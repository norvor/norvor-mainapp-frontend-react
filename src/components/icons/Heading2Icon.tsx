import React, { memo } from 'react';

const Heading2Icon: React.FC<{className?: string}> = ({className="w-5 h-5"}) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 12h8M4 18V6M12 18V6M21 18h-4a2 2 0 01-2-2V8a2 2 0 012-2h4v12z"/>
    </svg>
);

export default memo(Heading2Icon);
