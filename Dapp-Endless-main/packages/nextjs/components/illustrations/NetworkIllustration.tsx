const NetworkIllustration = ({ className = "w-full h-auto" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Background Grid Pattern */}
    <pattern id="grid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeOpacity="0.1" />
    </pattern>
    <rect width="400" height="300" fill="url(#grid)" />

    {/* Central Network Node */}
    <circle cx="200" cy="150" r="40" fill="url(#nodeGradient)" className="animate-pulse" />

    {/* Connected Nodes */}
    <g className="animate-orbit">
      <circle cx="120" cy="100" r="20" fill="url(#nodeGradient2)" />
      <circle cx="280" cy="100" r="20" fill="url(#nodeGradient2)" />
      <circle cx="120" cy="200" r="20" fill="url(#nodeGradient2)" />
      <circle cx="280" cy="200" r="20" fill="url(#nodeGradient2)" />
    </g>

    {/* Connection Lines */}
    <g strokeWidth="2" stroke="url(#lineGradient)" strokeDasharray="4 4">
      <line x1="200" y1="150" x2="120" y2="100" />
      <line x1="200" y1="150" x2="280" y2="100" />
      <line x1="200" y1="150" x2="120" y2="200" />
      <line x1="200" y1="150" x2="280" y2="200" />
    </g>

    {/* Data Particles */}
    <g className="animate-pulse">
      <circle cx="160" cy="125" r="3" fill="#00F2FF" />
      <circle cx="240" cy="125" r="3" fill="#00F2FF" />
      <circle cx="160" cy="175" r="3" fill="#00F2FF" />
      <circle cx="240" cy="175" r="3" fill="#00F2FF" />
    </g>

    {/* Gradients */}
    <defs>
      <linearGradient id="nodeGradient" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#00F2FF" />
        <stop offset="100%" stopColor="#1E90FF" />
      </linearGradient>
      <linearGradient id="nodeGradient2" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FFD700" />
        <stop offset="100%" stopColor="#FF8C00" />
      </linearGradient>
      <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#00F2FF" stopOpacity="0.5" />
        <stop offset="100%" stopColor="#1E90FF" stopOpacity="0.5" />
      </linearGradient>
    </defs>

    <style>
      {`
        @keyframes orbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-orbit {
          transform-origin: 200px 150px;
          animation: orbit 20s linear infinite;
        }
      `}
    </style>
  </svg>
);

export default NetworkIllustration;
