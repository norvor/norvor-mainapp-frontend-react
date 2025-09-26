
import React from 'react';

const SettingsIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-1.007 1.113-1.113l.44-2.251c.12-.613.633-1.09 1.285-1.12l.523-.024c.652-.03 1.285.444 1.405 1.058l.44 2.251c.553.106 1.023.571 1.113 1.113l2.251.44c.613.12.984.733.96 1.345l-.024.523c-.03.652-.518 1.165-1.17 1.285l-2.251.44a2.25 2.25 0 0 1-1.631 1.631l-.44 2.251c-.12.613-.633 1.09-1.285 1.12l-.523.024c-.652.03-1.285-.444-1.405-1.058l-.44-2.251a2.25 2.25 0 0 1-1.631-1.631l-2.251-.44c-.613-.12-.984-.733-.96-1.345l.024-.523c.03-.652.518-1.165 1.17-1.285l2.251-.44ZM12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z" />
    </svg>
);

export default SettingsIcon;
