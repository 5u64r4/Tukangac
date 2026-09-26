import React from 'react';

interface AcWashIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
  strokeWidth?: number | string;
}

export const AcWashIcon: React.FC<AcWashIconProps> = ({
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
      {/* 1. AC Indoor Outer Casing */}
      <path d="M 15 46 L 15 22 C 15 15 20 13 28 13 L 72 13 C 80 13 85 15 85 22 L 85 46 L 79 46 L 79 25 L 21 25 L 21 46 Z" />

      {/* 2. Evaporator Grill Frame & Horizontal Louvers */}
      <path d="M 21 25 L 79 25 L 76 52 L 24 52 Z" />
      <line x1="22" y1="32" x2="78" y2="32" strokeWidth={sw * 0.9} />
      <line x1="23" y1="39" x2="77" y2="39" strokeWidth={sw * 0.9} />
      <line x1="24" y1="46" x2="76" y2="46" strokeWidth={sw * 0.9} />

      {/* 3. Water Jet Spray Rays (4 expanding spray beams) */}
      <line x1="45" y1="67" x2="31" y2="42" strokeWidth={sw * 0.9} />
      <line x1="48" y1="67" x2="43" y2="42" strokeWidth={sw * 0.9} />
      <line x1="52" y1="67" x2="57" y2="42" strokeWidth={sw * 0.9} />
      <line x1="55" y1="67" x2="69" y2="42" strokeWidth={sw * 0.9} />

      {/* 4. Spray Gun Tip / Coupler */}
      <rect x="44" y="67" width="12" height="6" rx="1.5" strokeWidth={sw * 0.9} fill="currentColor" fillOpacity="0.15" />

      {/* 5. Flexible High-Pressure Water Hose */}
      <path d="M 47 73 C 47 83 55 85 64 88 C 69 90 71 93 71 95" strokeWidth={sw * 0.95} />
      <path d="M 53 73 C 53 78 61 80 70 83 C 75 85 77 89 77 95" strokeWidth={sw * 0.95} />

      {/* 6. Water Droplets */}
      {/* Top Left droplet */}
      <path d="M 33 56 C 30 61 30 64 33 66 C 36 66 37 63 35 58 Z" fill="currentColor" />
      {/* Far Left droplet */}
      <path d="M 24 62 C 20 67 20 70 24 72 C 28 72 29 69 27 64 Z" fill="currentColor" />
      {/* Bottom Left droplet */}
      <path d="M 38 75 C 35 79 35 82 38 84 C 41 84 42 81 40 77 Z" fill="currentColor" />

      {/* Top Right droplet */}
      <path d="M 68 56 C 65 58 63 63 67 66 C 70 64 70 61 67 56 Z" fill="currentColor" />
      {/* Far Right droplet */}
      <path d="M 76 62 C 74 64 72 69 76 72 C 80 70 80 67 76 62 Z" fill="currentColor" />
    </svg>
  );
};

export default AcWashIcon;
