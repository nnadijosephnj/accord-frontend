export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary':       '#a13900',
        'primary-bright':'#ea580c',
        'primary-light': '#ff793e',
        'navy':          '#0A3D62',
        'teal':          '#17B978',
      },
      fontFamily: {
        'sans':    ['Manrope', 'sans-serif'],
        'manrope': ['Manrope', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
