
import React from 'react';

const ScienceIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M14.5 2.5a2.5 2.5 0 0 0-5 0v1a2.5 2.5 0 0 0 5 0v-1z" />
    <path d="M12 14v8" />
    <path d="M12 4.5v2" />
    <path d="m15 11-1.5 1.5" />
    <path d="M9 11l1.5 1.5" />
    <path d="M12 14h.01" />
    <path d="M3.7 10.3a2.5 2.5 0 0 0 4.6 1.4" />
    <path d="M20.3 10.3a2.5 2.5 0 0 1-4.6 1.4" />
    <path d="M12 22a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
  </svg>
);

export default ScienceIcon;
