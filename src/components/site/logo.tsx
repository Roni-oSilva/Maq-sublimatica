import Image from "next/image";

/** Logotipo oficial. `light` = versão para fundos escuros. */
export function Logo({ light, className = "h-10 w-auto" }: { light?: boolean; className?: string }) {
  return (
    <Image
      src={light ? "/logo-light.png" : "/logo.png"}
      alt="Maq Sublimática"
      width={233}
      height={60}
      priority
      unoptimized
      className={className}
    />
  );
}

/** Setas ">>>" do universo visual da marca. */
export function Chevrons({ className = "h-8 w-auto", color = "currentColor" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 120 40" className={className} fill="none" stroke={color} strokeWidth="7" strokeLinecap="square" aria-hidden>
      <path d="M8 6l16 14L8 34" /><path d="M44 6l16 14-16 14" /><path d="M80 6l16 14-16 14" />
    </svg>
  );
}
