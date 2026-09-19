/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "retronexo-grey-100": "rgb(var(--rn-grey-100) / <alpha-value>)",
        "retronexo-grey-200": "rgb(var(--rn-grey-200) / <alpha-value>)",
        "retronexo-grey-300": "rgb(var(--rn-grey-300) / <alpha-value>)",
        "retronexo-grey-400": "rgb(var(--rn-grey-400) / <alpha-value>)",
        "retronexo-white": "rgb(var(--rn-white) / <alpha-value>)",
        "retronexo-pink": "rgb(var(--rn-pink) / <alpha-value>)",
        "retronexo-blue": "rgb(var(--rn-blue) / <alpha-value>)",
        "retronexo-blue-dark": "rgb(var(--rn-blue-dark) / <alpha-value>)",
        "retronexo-blue-hover": "rgb(var(--rn-blue-hover) / <alpha-value>)",
        "retronexo-blue-active": "rgb(var(--rn-blue-active) / <alpha-value>)",
        "retronexo-border": "rgb(var(--rn-border) / <alpha-value>)"
      },
      fontFamily: { retronexo: ["Barlow Condensed", "sans-serif"] }
    }
  },
  plugins: []
};
