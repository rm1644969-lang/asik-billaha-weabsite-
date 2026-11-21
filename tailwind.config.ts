import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#070707",
        surface: "#0F0F0F",
        "surface-light": "#171717",
        "surface-card": "rgba(18, 18, 18, 0.8)",
        primary: {
          DEFAULT: "#FACC15",
          hover: "#EAB308",
          glow: "rgba(250, 204, 21, 0.45)",
        },
        accent: {
          red: "#EF4444",
          redDark: "#DC2626",
          glow: "rgba(239, 68, 68, 0.45)",
        },
        cyber: {
          yellow: "#FFE600",
          gold: "#F59E0B",
          red: "#FF2E2E",
          crimson: "#DC2626",
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "Inter", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "hero-gradient": "radial-gradient(circle at 50% 0%, rgba(250, 204, 21, 0.15) 0%, rgba(239, 68, 68, 0.09) 35%, rgba(7, 7, 7, 1) 75%)",
        "card-glass": "linear-gradient(135deg, rgba(255, 255, 255, 0.07) 0%, rgba(255, 255, 255, 0.02) 100%)",
        "card-glass-hover": "linear-gradient(135deg, rgba(250, 204, 21, 0.12) 0%, rgba(239, 68, 68, 0.04) 100%)",
      },
      animation: {
        "pulse-glow": "pulse-glow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float-slow": "float 6s ease-in-out infinite",
        "float-fast": "float 3s ease-in-out infinite",
        "spin-slow": "spin 20s linear infinite",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.85", transform: "scale(1.04)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
      },
      boxShadow: {
        "neon-yellow": "0 4px 14px 0 rgba(250, 204, 21, 0.18)",
        "neon-red": "0 4px 14px 0 rgba(239, 68, 68, 0.18)",
        "neon-white": "0 4px 14px 0 rgba(255, 255, 255, 0.08)",
        "glass": "0 8px 32px 0 rgba(0, 0, 0, 0.7)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
export default config;
