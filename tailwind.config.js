export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        accord: {
          background: "#0A0A0A",
          surface: "#111111",
          border: "#1E1E1E",
          primary: "#F97316",
          primaryHover: "#EA6C0A",
          text: "#F5F5F5",
          muted: "#888888",
          disabled: "#444444",
          success: "#22C55E",
          warning: "#EAB308",
          destructive: "#EF4444",
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "sans-serif"],
      },
    },
  },
  plugins: [],
};
