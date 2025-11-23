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
        {/* Cloud shape matching the CloudBrowse design */}
        <path
          d="M12 42c-4.4 0-8-3.6-8-8s3.6-8 8-8c1.3 0 2.5 0.3 3.6 0.8C17.8 21.2 23.1 17 30 17c9.4 0 17 7.6 17 17 0 1.8-0.3 3.5-0.8 5.1C49.9 40.4 52 43 52 46c0 4.4-3.6 8-8 8H12z"
          fill="#4A9B8E"
        />

        {/* Network diagram inside cloud - larger, more visible nodes */}
        {/* Central node (largest) */}
        <circle
          cx="32"
          cy="32"
          r="3"
          fill="white"
        />

        {/* Primary nodes */}
        <circle cx="32" cy="22" r="2.5" fill="white" />
        <circle cx="32" cy="42" r="2.5" fill="white" />
        <circle cx="22" cy="32" r="2.5" fill="white" />
        <circle cx="42" cy="32" r="2.5" fill="white" />

        {/* Secondary nodes */}
        <circle cx="25" cy="25" r="2" fill="white" />
        <circle cx="39" cy="25" r="2" fill="white" />
        <circle cx="25" cy="39" r="2" fill="white" />
        <circle cx="39" cy="39" r="2" fill="white" />

        {/* Connection lines - thicker and more visible */}
        <path d="M32 29L32 25" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <path d="M32 35L32 39" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <path d="M29 32L25 32" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <path d="M35 32L39 32" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <path d="M29.5 29.5L27 27" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <path d="M34.5 29.5L37 27" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <path d="M29.5 34.5L27 37" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <path d="M34.5 34.5L37 37" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </svg>

      {showText && (
        <span className="logo-text" style={{
          fontWeight: 600,
          fontSize: size > 24 ? '1.2rem' : '1rem',
          color: 'currentColor'
        }}>
          CloudBrowse
        </span>
      )}
    </div>
  );
}; 