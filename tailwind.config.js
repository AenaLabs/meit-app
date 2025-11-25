/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#812797',
        secondary: '#61e0dc',
        neutral: '#606060',
        accent1: '#eeaa2b',
        accent2: '#b3e429',
      },
      fontFamily: {
        header: ['Arial Rounded MT Bold', 'sans-serif'],
        body: ['Lato-Light', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
