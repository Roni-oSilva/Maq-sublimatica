/** Caneca ilustrada, usada no hero enquanto não há uma foto de produto cadastrada. */
export function HeroMug({ className }: { className?: string }) {
  const brand = { fill: "rgb(var(--c-brand))" };
  const ink = { fill: "rgb(var(--c-ink))" };
  return (
    <svg viewBox="0 0 560 420" className={className} role="img" aria-label="Caneca personalizada">
      <ellipse cx="270" cy="392" rx="190" ry="16" fill="rgba(23,23,23,0.10)" />
      {/* alça */}
      <path d="M392 150h28a62 62 0 0 1 0 124h-30" fill="none" strokeWidth="30" strokeLinecap="round" style={{ stroke: "rgb(var(--c-ink))" }} />
      <path d="M392 150h28a62 62 0 0 1 0 124h-30" fill="none" strokeWidth="14" strokeLinecap="round" style={{ stroke: "rgb(var(--c-brand))" }} />
      {/* corpo */}
      <path d="M120 96h290v214a92 92 0 0 1-92 92h-106a92 92 0 0 1-92-92z" style={brand} />
      <path d="M120 96h60v306h-12a92 92 0 0 1-48-80z" fill="rgba(255,255,255,0.18)" />
      <path d="M350 96h60v214a92 92 0 0 1-60 86z" fill="rgba(0,0,0,0.12)" />
      {/* boca */}
      <ellipse cx="265" cy="96" rx="145" ry="30" style={ink} />
      <ellipse cx="265" cy="96" rx="128" ry="22" fill="#2b2b2b" />
      {/* marca */}
      <rect x="170" y="165" width="190" height="150" rx="22" fill="rgba(255,255,255,0.92)" />
      <image href="/logo-mark.png" x="190" y="205" width="150" height="102" preserveAspectRatio="xMidYMid meet" />
    </svg>
  );
}
