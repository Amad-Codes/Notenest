/** @type {import('tailwindcss').Config} */
import typography from "@tailwindcss/typography";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // "Paper & Ink" palette — a notebook-inspired theme, distinct from
        // generic warm-cream/terracotta or near-black/neon AI defaults.
        paper: {
          DEFAULT: "#F7F7F3", // cool-neutral page background (light mode)
          card: "#FFFFFF",
          dark: "#12141C", // page background (dark mode)
          darkcard: "#1B1E29",
        },
        ink: {
          DEFAULT: "#1C2541", // deep navy — primary text & brand accent
          soft: "#4A5578",
          dark: "#F1F1EE", // primary text in dark mode
        },
        accent: {
          DEFAULT: "#F2B705", // sticky-note yellow — primary interactive accent
          hover: "#D9A400",
        },
        line: {
          DEFAULT: "#E4E2DA", // hairline dividers, light mode
          dark: "#2B2F3D",
        },
        danger: {
          DEFAULT: "#D64545",
          hover: "#B93838",
        },
        note: {
          default: "#FFFFFF",
          yellow: "#FFF4CC",
          blue: "#DCE8FB",
          green: "#DFF3E3",
          pink: "#FBE0EC",
          purple: "#E9DEFA",
          orange: "#FCE4D2",
          "default-dark": "#242836",
          "yellow-dark": "#3A3320",
          "blue-dark": "#20293D",
          "green-dark": "#1F332A",
          "pink-dark": "#372430",
          "purple-dark": "#2C2540",
          "orange-dark": "#3A2B1D",
        },
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        sans: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(28, 37, 65, 0.06), 0 1px 3px rgba(28, 37, 65, 0.08)",
        "card-hover": "0 4px 12px rgba(28, 37, 65, 0.10), 0 2px 4px rgba(28, 37, 65, 0.08)",
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "scale-in": "scaleIn 0.15s ease-out",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
        scaleIn: { "0%": { opacity: 0, transform: "scale(0.97)" }, "100%": { opacity: 1, transform: "scale(1)" } },
      },
    },
  },
  plugins: [typography],
};
