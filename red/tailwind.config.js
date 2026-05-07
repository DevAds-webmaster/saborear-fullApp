/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          hero: "#042f2e",
          yellow: "#facc15",
          "yellow-hover": "#eab308",
          surface: "#f5f5f4",
        },
      },
    },
  },
  plugins: [],
};
