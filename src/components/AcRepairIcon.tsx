import React from 'react';

interface AcRepairIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
  strokeWidth?: number | string;
}

export const AcRepairIcon: React.FC<AcRepairIconProps> = ({
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
      {/* --- 1. DUAL MANIFOLD PRESSURE GAUGES (Top Left) --- */}
      {/* Left Dial Gauge */}
      <circle cx="19" cy="18" r="8.5" />
      {/* Left Dial Needle */}
      <path d="M 19 13.5 L 17.5 19.5 A 1.5 1.5 0 0 0 20.5 19.5 Z" fill="currentColor" strokeWidth={1} />
      {/* Left Dial Stem */}
      <path d="M 19 26.5 L 19 33.5" />

      {/* Right Dial Gauge */}
      <circle cx="39" cy="18" r="8.5" />
      {/* Right Dial Needle */}
      <path d="M 42 14.5 L 37.5 18 A 1.5 1.5 0 0 0 39.5 20.5 Z" fill="currentColor" strokeWidth={1} />
      {/* Right Dial Stem */}
      <path d="M 39 26.5 L 39 33.5" />

      {/* Manifold Horizontal Bar & Fittings */}
      <path d="M 10 33.5 L 13 33.5" />
      <rect x="13" y="30.5" width="9" height="6" rx="1" fill="currentColor" fillOpacity="0.15" />
      <path d="M 22 33.5 L 34 33.5" />
      <rect x="34" y="30.5" width="9" height="6" rx="1" fill="currentColor" fillOpacity="0.15" />
      <path d="M 43 33.5 L 46 33.5" />

      {/* Center Valve Knob */}
      <circle cx="28" cy="33.5" r="3.2" fill="currentColor" />

      {/* Hose from Manifold to Top Unit Valve */}
      <path d="M 28 36.5 C 28 42 34 43 51 43" strokeWidth={sw * 0.95} />

      {/* --- 2. TOP VALVE / SERVICE COMPRESSOR (Top Right) --- */}
      <path d="M 53 47 L 68 47" />
      <rect x="50" y="34" width="22" height="9.5" rx="3.5" fill="currentColor" fillOpacity="0.15" />
      <path d="M 54 34 L 54 29 L 68 29 L 68 34" />
      <path d="M 60 29 L 60 24 L 68 24" />

      {/* Right Loop Hose from Top Valve to Condenser Port */}
      <path d="M 72 41 L 87 41 L 87 78 L 80 78" strokeWidth={sw * 0.95} />

      {/* --- 3. OUTDOOR CONDENSER CASING --- */}
      <rect x="17" y="47" width="58" height="39" rx="4" />

      {/* Mounting Feet */}
      <path d="M 22 86 L 22 93 L 26 93" />
      <path d="M 70 86 L 70 93 L 66 93" />

      {/* Right Side Port Block */}
      <path d="M 75 73 L 80 73 L 80 83 L 75 83" fill="currentColor" fillOpacity="0.15" />

      {/* --- 4. CONDENSER FAN (Left of Casing) --- */}
      <circle cx="38" cy="67" r="14.5" />
      <circle cx="38" cy="67" r="3" fill="currentColor" />

      {/* 6 Curved Swirling Fan Blades */}
      <path d="M 38 64 C 38 57 43 54 48 56 C 44 60 42 63 40 65" strokeWidth={sw * 0.85} />
      <path d="M 40 65 C 46 63 51 66 52 71 C 47 69 43 69 40 68" strokeWidth={sw * 0.85} />
      <path d="M 40 69 C 42 75 39 80 34 81 C 36 76 37 72 38 70" strokeWidth={sw * 0.85} />
      <path d="M 36 69 C 31 71 26 68 25 63 C 29 65 33 65 36 66" strokeWidth={sw * 0.85} />
      <path d="M 36 65 C 34 59 28 56 27 61 C 30 62 33 64 36 65" strokeWidth={sw * 0.85} />

      {/* --- 5. RIGHT SIDE VENTILATION SLOTS --- */}
      <rect x="58" y="55" width="11" height="8" rx="1.5" strokeWidth={sw * 0.85} fill="currentColor" fillOpacity="0.15" />
      <line x1="58" y1="68" x2="69" y2="68" strokeWidth={sw * 0.85} />
      <line x1="58" y1="74" x2="69" y2="74" strokeWidth={sw * 0.85} />
      <line x1="58" y1="80" x2="69" y2="80" strokeWidth={sw * 0.85} />
    </svg>
  );
};

export default AcRepairIcon;
