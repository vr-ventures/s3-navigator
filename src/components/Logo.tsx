import React from 'react';

interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 32, showText = true, className = '' }) => {
  return (
    <div className={`logo ${className}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Cloud base */}
        <path
          d="M16 40c-4.4 0-8-3.6-8-8 0-4.4 3.6-8 8-8 1.1 0 2.1 0.2 3.1 0.6C20.3 20.1 24.9 17 30 17c6.6 0 12 5.4 12 12 0 1.3-0.2 2.5-0.6 3.7C43.3 33.4 45 35.5 45 38c0 3.3-2.7 6-6 6H16z"
          fill="currentColor"
          opacity="0.8"
        />

        {/* Folder icon inside cloud */}
        <path
          d="M22 28h16c1.1 0 2 0.9 2 2v8c0 1.1-0.9 2-2 2H22c-1.1 0-2-0.9-2-2v-8c0-1.1 0.9-2 2-2z"
          fill="white"
          stroke="currentColor"
          strokeWidth="1"
        />

        {/* Navigation compass needle */}
        <circle
          cx="48"
          cy="16"
          r="12"
          fill="currentColor"
          opacity="0.9"
        />
        <path
          d="M48 8l3 6-3 2-3-2z"
          fill="white"
        />
        <path
          d="M48 24l-3-6 3-2 3 2z"
          fill="white"
          opacity="0.7"
        />
        <circle
          cx="48"
          cy="16"
          r="2"
          fill="white"
        />

        {/* Connection lines */}
        <path
          d="M36 16h6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.6"
        />
        <path
          d="M42 20l4-4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.6"
        />
      </svg>

      {showText && (
        <span className="logo-text" style={{
          fontWeight: 600,
          fontSize: size > 24 ? '1.2rem' : '1rem',
          color: 'currentColor'
        }}>
          S3 Navigator
        </span>
      )}
    </div>
  );
}; 