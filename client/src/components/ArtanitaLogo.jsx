import React from 'react';

export default function ArtanitaLogo({ size = 36 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
    >
      {/* Outer Green Ring */}
      <circle cx="50" cy="50" r="47" fill="#008a3d" stroke="#f4b400" strokeWidth="3" />
      {/* Inner White/Gold Circle */}
      <circle cx="50" cy="50" r="40" fill="#ffffff" stroke="#006622" strokeWidth="2" />
      
      {/* Shield in Center */}
      <path
        d="M50 18 L72 26 V52 C72 67 50 80 50 80 C50 80 28 67 28 52 V26 Z"
        fill="#009640"
        stroke="#f4b400"
        strokeWidth="2"
      />
      
      {/* Golden Book at Bottom of Shield */}
      <path
        d="M38 60 Q50 56 50 63 Q50 56 62 60 L62 68 Q50 64 50 71 Q50 64 38 68 Z"
        fill="#fbc02d"
        stroke="#e65100"
        strokeWidth="1.5"
      />
      
      {/* Torch / Flame in Center */}
      <path
        d="M50 30 Q56 40 50 50 Q44 40 50 30 Z"
        fill="#ff3d00"
      />
      <circle cx="50" cy="40" r="4" fill="#ffd600" />
      
      {/* Torch Handle */}
      <rect x="48" y="50" width="4" height="12" fill="#ffd600" rx="1" />
      
      {/* Star at Top */}
      <polygon
        points="50,22 52,27 57,27 53,30 55,35 50,32 45,35 47,30 43,27 48,27"
        fill="#ffd600"
      />
      
      {/* Small Decorative Text Ring */}
      <circle cx="50" cy="50" r="44" stroke="rgba(255,255,255,0.4)" strokeWidth="1" strokeDasharray="2 3" />
    </svg>
  );
}
