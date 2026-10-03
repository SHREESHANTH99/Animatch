/** @type {import("tailwindcss").Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        // Premium dark theme — "Cinematic Anime" palette
        // Deep black base
        anidark: {
          950: "#080810",
          900: "#0d0d1a",
          800: "#13131f",
          700: "#1a1a2e",
        },
        // Crimson/red accent — anime energy, not AI
        anicrimson: {
          400: "#ff6b6b",
          500: "#e63946",
          600: "#c1121f",
        },
        // Soft gold for ratings/stars
        anigold: {
          400: "#ffd166",
          500: "#f4a261",
        },
        // Subtle teal for secondary elements
        aniteal: {
          400: "#06d6a0",
          500: "#0cb89a",
        },
      },
      boxShadow: {
        "crimson": "0 0 30px rgba(230, 57, 70, 0.3)",
        "crimson-lg": "0 0 60px rgba(230, 57, 70, 0.4)",
      },
      backgroundImage: {
        "radial-dark": "radial-gradient(ellipse at top, #1a1a2e 0%, #080810 70%)",
        "radial-crimson": "radial-gradient(ellipse at 50% 0%, rgba(198,12,48,0.15) 0%, transparent 60%)",
      },
    },
  },
  plugins: [],
};
