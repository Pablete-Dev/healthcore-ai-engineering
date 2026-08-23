/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./uis/website/*.html",
    "./uis/website/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        hcNavy: "#181e42",
        hcTeal: "#1d8d6b",
        hcSand: "#f6faf8",
        hcSlate: "#4a5568",
        hcCoral: "#1d2141",
        hcSky: "#ecf3f5",
        hcBlue: "#4da9e9"
      },
      fontFamily: {
        heading: ["ui-sans-serif", "system-ui", "sans-serif"],
        body: ["ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        soft: "0 14px 32px rgba(24, 30, 66, 0.12)"
      }
    }
  },
  plugins: []
}
