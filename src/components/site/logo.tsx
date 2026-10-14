/** Marca padrão: quatro pontos nas cores de impressão (ciano, magenta, amarelo, preto). */
export function Logo({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} role="img" aria-label="Maq Sublimática">
      <rect width="40" height="40" rx="10" fill="#14122b" />
      <circle cx="14" cy="14" r="6" fill="#0aa6c9" />
      <circle cx="26" cy="14" r="6" fill="#e0267a" fillOpacity=".9" />
      <circle cx="14" cy="26" r="6" fill="#f5c518" fillOpacity=".9" />
      <circle cx="26" cy="26" r="6" fill="#ffffff" fillOpacity=".92" />
    </svg>
  );
}
