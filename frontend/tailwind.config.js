/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Livvic", "sans-serif"],
        display: ["Livvic", "sans-serif"],
      },
      colors: {
        brand: {
          50:  "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        surface: {
          0:   "#ffffff",
          50:  "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
        },
      },
      boxShadow: {
        card:  "0 1px 3px 0 rgb(0 0 0 / .06), 0 1px 2px -1px rgb(0 0 0 / .06)",
        panel: "0 4px 24px -4px rgb(37 99 235 / .12), 0 1px 4px rgb(0 0 0 / .06)",
        float: "0 20px 60px -12px rgb(0 0 0 / .18)",
      },
      animation: {
        "slide-down": "slideDown 0.2s ease-out",
        "fade-in":    "fadeIn 0.25s ease-out",
        "progress":   "progress 0.4s ease",
        "pulse-soft": "pulseSoft 2s cubic-bezier(.4,0,.6,1) infinite",
      },
      keyframes: {
        slideDown: {
          "0%":   { opacity: 0, transform: "translateY(-8px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        fadeIn: {
          "0%":   { opacity: 0 },
          "100%": { opacity: 1 },
        },
        pulseSoft: {
          "0%, 100%": { opacity: 1 },
          "50%":      { opacity: 0.5 },
        },
      },
    },
  },
  plugins: [],
};
