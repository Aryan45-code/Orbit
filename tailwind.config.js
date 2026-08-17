/** @type {import('tailwindcss').Config} */

// Semantic tokens resolve to CSS variables defined in src/index.css, so a
// single `.dark` class on <html> reskins the whole app. Components never
// name a raw zinc/violet shade for chrome — they say what a colour *means*
// (canvas / surface / border / fg / accent) and the theme decides.
const token = (name) => `rgb(var(${name}) / <alpha-value>)`;

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        canvas: token("--canvas"),
        surface: token("--surface"),
        "surface-2": token("--surface-2"),
        "surface-3": token("--surface-3"),
        line: token("--line"),
        "line-strong": token("--line-strong"),
        fg: token("--fg"),
        "fg-muted": token("--fg-muted"),
        "fg-subtle": token("--fg-subtle"),
        accent: token("--accent"),
        "accent-fg": token("--accent-fg"),
        inverse: token("--inverse"),
        "inverse-fg": token("--inverse-fg"),
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        riseIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        // Screen-level entrances only. Individual list rows are deliberately
        // not animated — staggering every card was the single biggest source
        // of the "everything wobbles on load" feel.
        "fade-in": "fadeIn 0.2s ease-out both",
        "rise-in": "riseIn 0.28s cubic-bezier(0.16, 1, 0.3, 1) both",
        shimmer: "shimmer 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
