import React from 'react';

interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 64, showText = true, className = '' }) => {
  const logoSize = size;
  const textSize = size > 48 ? '1.4rem' : size > 32 ? '1.1rem' : '0.9rem';
  
  return (
    <div className={`logo ${className}`} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <svg
        width={logoSize}
        height={logoSize}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background circle */}
        <circle
          cx="100"
          cy="100"
          r="95"
          fill="#1a365d"
          stroke="#2d3748"
          strokeWidth="2"
        />
        
        {/* Main cloud shape */}
        <path
          d="M60 110c-8 0-15-7-15-15s7-15 15-15c2 0 4 0.5 5.5 1.2C68 72 76 65 85 65c12 0 22 10 22 22 0 2.5-0.4 4.8-1.2 7 3.5 0.8 6.2 4 6.2 7.8 0 4.4-3.6 8-8 8H60z"
          fill="#ff8c42"
        />
        
        <path
          d="M85 125c-6 0-11-5-11-11s5-11 11-11c1.5 0 3 0.3 4.2 0.9C91.5 98 96.5 93 102 93c9 0 16.5 7.5 16.5 16.5 0 1.8-0.3 3.6-0.9 5.2 2.6 0.6 4.6 3 4.6 5.8 0 3.3-2.7 6-6 6H85z"
          fill="#ff8c42"
          opacity="0.8"
        />
        
        {/* JSON Document */}
        <rect
          x="45"
          y="85"
          width="25"
          height="30"
          rx="3"
          fill="#2d3748"
          stroke="#ff8c42"
          strokeWidth="2"
        />
        <text
          x="57.5"
          y="102"
          fill="#ff8c42"
          fontSize="8"
          fontWeight="bold"
          textAnchor="middle"
        >
          JSON
        </text>
        <line x1="50" y1="107" x2="65" y2="107" stroke="#ff8c42" strokeWidth="1"/>
        <line x1="50" y1="110" x2="60" y2="110" stroke="#ff8c42" strokeWidth="1"/>
        
        {/* MD Document */}
        <rect
          x="80"
          y="95"
          width="22"
          height="25"
          rx="3"
          fill="#2d3748"
          stroke="#ff8c42"
          strokeWidth="2"
        />
        <text
          x="91"
          y="109"
          fill="#ff8c42"
          fontSize="7"
          fontWeight="bold"
          textAnchor="middle"
        >
          MD
        </text>
        <line x1="84" y1="113" x2="98" y2="113" stroke="#ff8c42" strokeWidth="1"/>
        <line x1="84" y1="116" x2="94" y2="116" stroke="#ff8c42" strokeWidth="1"/>
        
        {/* Image icon */}
        <rect
          x="130"
          y="105"
          width="20"
          height="18"
          rx="2"
          fill="#2d3748"
          stroke="#ff8c42"
          strokeWidth="2"
        />
        <circle cx="136" cy="112" r="2" fill="#ff8c42"/>
        <path d="M132 119l4-3 4 2 6-4v6H132v-1z" fill="#ff8c42"/>
        
        {/* Navigation Compass */}
        <circle
          cx="110"
          cy="75"
          r="18"
          fill="#2d3748"
          stroke="#ff8c42"
          strokeWidth="3"
        />
        
        {/* Compass needle - North */}
        <path
          d="M110 60l4 12-4 3-4-3z"
          fill="#ff8c42"
        />
        
        {/* Compass needle - South */}
        <path
          d="M110 90l-4-12 4-3 4 3z"
          fill="#ff8c42"
          opacity="0.7"
        />
        
        {/* Compass needle - East */}
        <path
          d="M125 75l-12-4 3-4 3 4z"
          fill="#ff8c42"
          opacity="0.6"
        />
        
        {/* Compass needle - West */}
        <path
          d="M95 75l12 4-3 4-3-4z"
          fill="#ff8c42"
          opacity="0.6"
        />
        
        {/* Center dot */}
        <circle
          cx="110"
          cy="75"
          r="3"
          fill="#ff8c42"
        />
        
        {/* Decorative stars */}
        <g fill="#ff8c42">
          {/* Large star */}
          <path d="M155 45l3 6 6-1-4 5 4 5-6-1-3 6-3-6-6 1 4-5-4-5 6 1z"/>
          
          {/* Medium star */}
          <path d="M170 70l2 4 4-1-3 3 3 3-4-1-2 4-2-4-4 1 3-3-3-3 4 1z"/>
          
          {/* Small star */}
          <path d="M40 50l1.5 3 3-0.5-2 2.5 2 2.5-3-0.5-1.5 3-1.5-3-3 0.5 2-2.5-2-2.5 3 0.5z"/>
          
          {/* Tiny sparkle */}
          <circle cx="160" cy="120" r="2"/>
          <path d="M160 116v8M156 120h8" stroke="#ff8c42" strokeWidth="1"/>
        </g>
      </svg>
      
      {showText && (
        <span className="logo-text" style={{ 
          fontWeight: 700, 
          fontSize: textSize,
          color: '#ff8c42',
          textShadow: '0 1px 2px rgba(0,0,0,0.1)',
          letterSpacing: '-0.5px'
        }}>
          s3-navigator
        </span>
      )}
    </div>
  );
}; 