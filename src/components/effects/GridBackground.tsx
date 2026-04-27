export default function GridBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at top left, rgba(0,229,255,0.10), transparent 50%), radial-gradient(ellipse at bottom right, rgba(168,85,247,0.12), transparent 55%), linear-gradient(180deg, #070B14 0%, #05080F 100%)'
        }}
      />
      <svg className="absolute inset-0 h-full w-full opacity-[0.22]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="rgba(138,148,184,0.08)" strokeWidth="1" />
          </pattern>
          <radialGradient id="fade" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <mask id="fade-mask">
            <rect width="100%" height="100%" fill="url(#fade)" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" mask="url(#fade-mask)" />
      </svg>
      {/* Accent orbs */}
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-neon-cyan/20 blur-[120px]" />
      <div className="absolute -bottom-40 -right-40 h-[28rem] w-[28rem] rounded-full bg-neon-violet/20 blur-[140px]" />
    </div>
  )
}
