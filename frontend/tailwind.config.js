/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  important: "#root",
  plugins: [require("@tailwindcss/typography")],
  corePlugins: {
    preflight: false,
  },
};
