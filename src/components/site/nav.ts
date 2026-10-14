export const NAV_KEYS = [
  { href: "/", key: "nav_home" },
  { href: "/loja", key: "nav_shop" },
  { href: "/artes-prontas", key: "nav_artworks" },
  { href: "/servicos", key: "nav_services" },
  { href: "/personalizar", key: "nav_custom" },
  { href: "/sobre", key: "nav_about" },
] as const;

export function navItems(t: Record<string, string>) {
  return NAV_KEYS.map((n) => ({ href: n.href, label: t[n.key] }));
}
