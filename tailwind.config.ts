import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: { DEFAULT: "1rem", sm: "1.5rem", lg: "2rem" }, screens: { "2xl": "1280px" } },
    extend: {
      colors: {
        ink: { DEFAULT: "#14122b", soft: "#2a2750", muted: "#6b6a85" },
        brand: { DEFAULT: "#c2185b", dark: "#9c1049", light: "#fce4ee" },
        cyan: { brand: "#0aa6c9" },
        paper: "#faf9fc",
        line: "#e7e5f0",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "ui-sans-serif", "sans-serif"],
      },
      keyframes: {
        "fade-up": { from: { opacity: "0", transform: "translateY(12px)" }, to: { opacity: "1", transform: "none" } },
      },
      animation: { "fade-up": "fade-up .5s ease-out both" },
    },
  },
  plugins: [],
};
export default config;
