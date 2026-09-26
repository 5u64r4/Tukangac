import React from 'react';

interface AcInstallIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
  strokeWidth?: number | string;
}

export const AcInstallIcon: React.FC<AcInstallIconProps> = ({
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
      {/* 1. Vibration / Motion Waves around AC Unit */}
      <path d="M 10 16 C 8 13 8 11 10 8" strokeWidth={sw * 0.75} />
      <path d="M 6 20 C 3 16 3 13 5 9" strokeWidth={sw * 0.75} />
      <path d="M 90 8 C 92 11 92 13 90 16" strokeWidth={sw * 0.75} />
      <path d="M 95 9 C 97 13 97 16 94 20" strokeWidth={sw * 0.75} />

      {/* 2. Indoor AC Unit Held High (Horizontal casing with airflow flap) */}
      <rect
        x="13"
        y="9"
        width="74"
        height="20"
        rx="3.5"
        fill="currentColor"
        fillOpacity="0.1"
      />
      <rect
        x="18"
        y="21"
        width="64"
        height="5"
        rx="1"
        strokeWidth={sw * 0.8}
        fill="currentColor"
        fillOpacity="0.2"
      />
      <line x1="20" y1="29" x2="35" y2="29" strokeWidth={sw * 0.8} />

      {/* 3. A-Frame Stepladder Structure */}
      {/* Top Cap */}
      <line x1="44" y1="50" x2="53" y2="50" strokeWidth={sw * 1.1} />
      {/* Left Front Stile */}
      <line x1="45" y1="50" x2="25" y2="94" strokeWidth={sw * 0.95} />
      {/* Right Front Stile */}
      <line x1="52" y1="50" x2="68" y2="94" strokeWidth={sw * 0.95} />
      {/* Back Support Stile */}
      <line x1="49" y1="50" x2="37" y2="94" strokeWidth={sw * 0.75} strokeDasharray="1 0" />

      {/* Ladder Rungs */}
      <line x1="42" y1="59" x2="56" y2="59" strokeWidth={sw * 0.85} />
      <line x1="37" y1="69" x2="60" y2="69" strokeWidth={sw * 0.85} />
      <line x1="32" y1="80" x2="64" y2="80" strokeWidth={sw * 0.85} />
      <line x1="28" y1="90" x2="67" y2="90" strokeWidth={sw * 0.85} />

      {/* 4. Technician Silhouette Line-Art */}
      {/* Head */}
      <circle cx="37" cy="27" r="7" fill="currentColor" strokeWidth={0} />

      {/* Left Arm & Hand lifting left side of AC */}
      <path d="M 31 34 L 18 19 L 23 19" strokeWidth={sw * 1.1} />
      <circle cx="20" cy="18" r="2.5" fill="currentColor" strokeWidth={0} />

      {/* Right Arm & Hand lifting right side of AC */}
      <path d="M 43 34 L 64 21 L 68 24" strokeWidth={sw * 1.1} />
      <circle cx="65" cy="21" r="2.5" fill="currentColor" strokeWidth={0} />

      {/* Torso */}
      <path d="M 37 34 L 35 55" strokeWidth={sw * 1.3} />

      {/* Upper Leg (Bent stepping high on upper ladder rung) */}
      <path d="M 35 55 C 43 49 47 55 42 69" strokeWidth={sw * 1.1} />

      {/* Lower Leg (Lower foot stepping on climbing rung) */}
      <path d="M 35 55 L 28 66 L 31 80" strokeWidth={sw * 1.1} />

      {/* 5. Technician Toolbox on the floor */}
      <rect x="74" y="85" width="20" height="9" rx="1.5" strokeWidth={sw * 0.85} fill="currentColor" fillOpacity="0.2" />
      <line x1="72" y1="85" x2="96" y2="85" strokeWidth={sw * 0.85} />
      <path d="M 80 85 L 80 81 L 88 81 L 88 85" strokeWidth={sw * 0.8} />
    </svg>
  );
};

export default AcInstallIcon;
