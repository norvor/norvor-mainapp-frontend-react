import React from 'react';

const TrashIcon: React.FC<{className?: string}> = ({className="w-4 h-4"}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.9h1.368c1.603 0 2.816 1.336 2.816 2.9zM12 3.25a.75.75 0 01.75.75v.008l.008.008h-.016v-.016a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008l.008.008h-.016v-.016A.75.75 0 0112 3.25z" clipRule="evenodd" />
    </svg>
);

export default TrashIcon;
