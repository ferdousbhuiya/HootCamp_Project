import React from 'react';

const Icon = ({ path, className = 'w-6 h-6' }: { path: string; className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d={path} />
  </svg>
);

export const CheckCircleIcon = (props: { className?: string }) => (
  <Icon
    {...props}
    path="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
  />
);

export const ArrowRightCircleIcon = (props: { className?: string }) => (
  <Icon
    {...props}
    path="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"
  />
);

export const SparklesIcon = (props: { className?: string }) => (
  <Icon
    {...props}
    path="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z"
  />
);
