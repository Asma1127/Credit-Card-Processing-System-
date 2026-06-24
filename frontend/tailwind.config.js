/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1f5f61",     // dark teal
        secondary: "#7fa9a8",   // light teal
        accent: "#f4b233",      // mustard yellow
        lightbg: "#f7f7f7"
      }
    }
  },
  plugins: []
}
