/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/lib/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(0, 0%, 100%)",
        foreground: "hsl(222.2, 47.4%, 11.2%)",
        primary: "#ff6600",
        "primary-foreground": "#ffffff",
        accent: "hsl(210, 40%, 96%)",
        ring: "#ff6600",
        input: "#e5e7eb"
      }
    },
  },
  plugins: [],
};
