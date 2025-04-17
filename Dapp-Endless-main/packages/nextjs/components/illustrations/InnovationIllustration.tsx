const InnovationIllustration = ({ className = "w-full h-auto" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Background Circuit Pattern */}
    <pattern id="circuit" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
      <path d="M 0 25 H 50 M 25 0 V 50" stroke="currentColor" strokeOpacity="0.1" strokeDasharray="2 4" />
    </pattern>
    <rect width="400" height="300" fill="url(#circuit)" />

    {/* Central Lightbulb */}
    <g className="animate-float">
      <path
        d="M200 80C166.863 80 140 106.863 140 140C140 162.661 153.049 182.303 172.5 191.113V210C172.5 216.904 178.096 222.5 185 222.5H215C221.904 222.5 227.5 216.904 227.5 210V191.113C246.951 182.303 260 162.661 260 140C260 106.863 233.137 80 200 80Z"
        fill="url(#bulbGradient)"
      />
      <rect x="185" y="222.5" width="30" height="7.5" rx="2" fill="url(#bulbGradient)" />
      <rect x="190" y="235" width="20" height="7.5" rx="2" fill="url(#bulbGradient)" />
    </g>

    {/* Orbiting Ideas */}
    <g className="animate-orbit">
      {/* Code Symbol */}
      <g transform="translate(120,140)">
        <rect width="30" height="20" rx="2" fill="url(#ideaGradient1)" />
        <text x="15" y="15" textAnchor="middle" fill="white" fontSize="12">{`</>`}</text>
      </g>
      {/* Lightning Bolt */}
      <path transform="translate(250,140)" d="M15 0L0 15H10L5 30L20 15H10L15 0Z" fill="url(#ideaGradient2)" />
    </g>

    {/* AI Nodes */}
    <g className="animate-pulse">
      <circle cx="160" cy="100" r="5" fill="#00F2FF" />
      <circle cx="240" cy="100" r="5" fill="#00F2FF" />
      <circle cx="160" cy="180" r="5" fill="#00F2FF" />
      <circle cx="240" cy="180" r="5" fill="#00F2FF" />
    </g>

    {/* Connection Lines */}
    <g strokeWidth="1" stroke="url(#connectionGradient)" strokeDasharray="3 3">
      <path d="M160 100Q200 140 240 100" />
      <path d="M160 180Q200 140 240 180" />
      <path d="M160 100Q200 140 160 180" />
      <path d="M240 100Q200 140 240 180" />
    </g>

    {/* Gradients */}
    <defs>
      <linearGradient id="bulbGradient" x1="140" y1="80" x2="260" y2="242.5">
        <stop offset="0%" stopColor="#FFD700" />
        <stop offset="100%" stopColor="#FF8C00" />
      </linearGradient>
      <linearGradient id="ideaGradient1" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#00F2FF" />
        <stop offset="100%" stopColor="#1E90FF" />
      </linearGradient>
      <linearGradient id="ideaGradient2" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FFD700" />
        <stop offset="100%" stopColor="#FF8C00" />
      </linearGradient>
      <linearGradient id="connectionGradient" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#00F2FF" stopOpacity="0.5" />
        <stop offset="100%" stopColor="#1E90FF" stopOpacity="0.5" />
      </linearGradient>
    </defs>

    <style>
      {`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes orbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-orbit {
          transform-origin: 200px 140px;
          animation: orbit 15s linear infinite;
        }
      `}
    </style>
  </svg>
);

export default InnovationIllustration;
