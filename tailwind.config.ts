import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: { DEFAULT: "1rem", sm: "1.5rem", lg: "2rem" }, screens: { "2xl": "1280px" } },
    extend: {
      colors: {
        // Paleta da marca: preto #171717 + laranja #F25623 (+ lima e creme de apoio)
        // Valores vêm de variáveis CSS, editáveis em Admin → Textos e imagens → Cores.
        ink: { DEFAULT: "rgb(var(--c-ink) / <alpha-value>)", soft: "rgb(var(--c-ink-soft) / <alpha-value>)", muted: "#6b6761" },
        brand: {
          DEFAULT: "rgb(var(--c-brand) / <alpha-value>)",
          dark: "rgb(var(--c-brand-dark) / <alpha-value>)",
          text: "rgb(var(--c-brand-text) / <alpha-value>)",
          light: "rgb(var(--c-brand-light) / <alpha-value>)",
        },
        lime: "rgb(var(--c-lime) / <alpha-value>)",
        cream: "rgb(var(--c-cream) / <alpha-value>)",
        paper: "rgb(var(--c-paper) / <alpha-value>)",
        "paper-2": "rgb(var(--c-paper-2) / <alpha-value>)",
        line: "#e6e2da",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      keyframes: {
        "fade-up": { from: { opacity: "0", transform: "translateY(14px)" }, to: { opacity: "1", transform: "none" } },
        float: { "0%,100%": { transform: "translateY(0) rotate(0deg)" }, "50%": { transform: "translateY(-14px) rotate(1.5deg)" } },
        ring: { "0%": { transform: "scale(1)", opacity: ".55" }, "100%": { transform: "scale(1.9)", opacity: "0" } },
        wiggle: { "0%,100%": { transform: "rotate(0)" }, "25%": { transform: "rotate(-6deg)" }, "75%": { transform: "rotate(6deg)" } },
        marquee: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
      },
      animation: { "fade-up": "fade-up .7s cubic-bezier(.2,.7,.2,1) both", wiggle: "wiggle .5s ease-in-out", marquee: "marquee 28s linear infinite" },
    },
  },
  plugins: [],
};
export default config;
