import React from 'react';

interface Props {
  size?: number;
}

export default function AppLogo({ size = 32 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="8" fill="url(#logo-grad)" />
      <path
        d="M16 6L26 11.5V20.5L16 26L6 20.5V11.5L16 6Z"
        stroke="white"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M16 6V26M6 11.5L26 20.5M26 11.5L6 20.5"
        stroke="white"
        strokeWidth="1"
        strokeOpacity="0.4"
      />
      <defs>
        <linearGradient id="logo-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00B388" />
          <stop offset="1" stopColor="#1DE9B6" />
        </linearGradient>
      </defs>
    </svg>
  );
}
