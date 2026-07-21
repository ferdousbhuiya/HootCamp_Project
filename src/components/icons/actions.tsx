import React from 'react';

const Icon = ({ path, className = 'w-6 h-6' }: { path: string; className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path fillRule="evenodd" d={path} clipRule="evenodd" />
  </svg>
);

export const PencilIcon = (props: { className?: string }) => (
  <Icon
    {...props}
    path="M17.293 2.293a1 1 0 011.414 0l2 2a1 1 0 010 1.414l-11 11a1 1 0 01-.586.293H7a1 1 0 01-1-1v-1.707a1 1 0 01.293-.586l11-11zM16.586 4L8 12.586V15h2.414L19 6.414 16.586 4z"
  />
);

export const TrashIcon = (props: { className?: string }) => (
  <Icon
    {...props}
    path="M9 3a1 1 0 011-1h4a1 1 0 011 1v1h4a1 1 0 110 2h-1v10a2 2 0 01-2 2H7a2 2 0 01-2-2V6H4a1 1 0 110-2h4V3zm2 2v10h2V5h-2z"
  />
);

export const PlusCircleIcon = (props: { className?: string }) => (
  <Icon
    {...props}
    path="M12 2a10 10 0 100 20 10 10 0 000-20zm-1 11H8v-2h3V8h2v3h3v2h-3v3h-2v-3z"
  />
);
