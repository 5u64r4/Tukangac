import React from 'react';

interface FreonTankIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
  strokeWidth?: number | string;
}

export const FreonTankIcon: React.FC<FreonTankIconProps> = ({
  className = 'w-6 h-6',
  size,
  strokeWidth = 2.4,
  ...props
}) => {
  const sw = typeof strokeWidth === 'number' ? strokeWidth * 2 : 4.8;

  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width={size}
      height={size}
      stroke="currentColor"
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {/* 1. Top Handles & Center Valve (Shroud Collar) */}
      {/* Left Top Handle */}
      <path d="M 30 25 C 30 14 34 11 43 11 L 44 22" />
      {/* Right Top Handle */}
      <path d="M 70 25 C 70 14 66 11 57 11 L 56 22" />
      {/* Center Valve & Nozzle Outlet */}
      <path d="M 47 18 L 47 13 L 53 13 L 53 18" strokeWidth={sw * 0.9} />
      <line x1="44" y1="13" x2="56" y2="13" strokeWidth={sw * 0.9} />

      {/* 2. Main Cylindrical Tank Body (Optimal width and curves) */}
      <path d="M 23 32 C 23 23 35 22 50 22 C 65 22 77 23 77 32 L 77 71 C 77 81 65 87 50 87 C 35 87 23 81 23 71 Z" />

      {/* 3. Bottom Ring Stand Base */}
      <path d="M 30 84 L 26 93 C 26 95 30 96 36 96 L 64 96 C 70 96 74 95 74 93 L 70 84" />

      {/* 4. Lower Seam Welded Line across cylinder */}
      <line x1="20" y1="71" x2="33" y2="71" strokeWidth={sw * 0.85} />
      <line x1="39" y1="71" x2="79" y2="71" strokeWidth={sw * 0.85} />

      {/* 5. Central Refrigerant Cycle / Cooling Circle Arrows */}
      {/* Top-right to bottom-left arc */}
      <path d="M 61 38 C 67 43 68 50 65 57 C 63 62 58 66 51 67" strokeWidth={sw * 0.9} />
      {/* Top arrow head */}
      <path d="M 64 45 L 70 43 L 71 49" strokeWidth={sw * 0.9} />

      {/* Bottom-left to top-right arc */}
      <path d="M 39 58 C 33 53 32 46 35 39 C 37 34 42 30 49 29" strokeWidth={sw * 0.9} />
      {/* Bottom arrow head */}
      <path d="M 36 51 L 30 53 L 29 47" strokeWidth={sw * 0.9} />

      {/* 6. Precision Snowflake inside the circle */}
      {/* Vertical spoke */}
      <line x1="50" y1="36" x2="50" y2="60" strokeWidth={sw * 0.85} />
      <path d="M 46 39 L 50 36 L 54 39" strokeWidth={sw * 0.85} />
      <path d="M 46 57 L 50 60 L 54 57" strokeWidth={sw * 0.85} />

      {/* Diagonal spoke 1 (top-left to bottom-right) */}
      <line x1="40" y1="42" x2="60" y2="54" strokeWidth={sw * 0.85} />
      <path d="M 40 47 L 40 42 L 45 42" strokeWidth={sw * 0.85} />
      <path d="M 55 54 L 60 54 L 60 49" strokeWidth={sw * 0.85} />

      {/* Diagonal spoke 2 (bottom-left to top-right) */}
      <line x1="40" y1="54" x2="60" y2="42" strokeWidth={sw * 0.85} />
      <path d="M 40 49 L 40 54 L 45 54" strokeWidth={sw * 0.85} />
      <path d="M 55 42 L 60 42 L 60 47" strokeWidth={sw * 0.85} />
    </svg>
  );
};

export default FreonTankIcon;
