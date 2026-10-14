import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: { DEFAULT: "1rem", sm: "1.5rem", lg: "2rem" }, screens: { "2xl": "1280px" } },
    extend: {
      colors: {
        // Paleta da marca: preto #171717 + laranja #F25623 (+ lima e creme de apoio)
        ink: { DEFAULT: "#171717", soft: "#2b2a28", muted: "#6b6761" },
        brand: { DEFAULT: "#F25623", dark: "#d13f0e", text: "#bf3a0a", light: "#fdebe4" },
        lime: "#cde82a",
        cream: "#f1f3dc",
        paper: "#f8f6f1",
        line: "#e6e2da",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Impact", "ui-sans-serif", "sans-serif"],
        script: ["var(--font-script)", "cursive"],
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
