import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class", // supports .dark mode switch
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0D2C54", // Heading Blue
        accent: "#FFB400", // Warm Amber
        surface: "#FAFAFA", // Ivory
        text: "#2F2F2F", // Graphite
        success: "#2ECC71", // Emerald
        highlight: "#E57973", // Muted Coral
        border: "#E5E7EB", // Neutral Border
      },
      fontFamily: {
        heading: ["Inter", "sans-serif"],
        body: ["Noto Sans", "sans-serif"],
        accent: ["Noto Serif Display", "serif"],
      },
      boxShadow: {
        soft: "0 2px 6px rgba(0, 0, 0, 0.06)",
        medium: "0 4px 10px rgba(0, 0, 0, 0.1)",
      },
      borderRadius: {
        sm: "0.375rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.5rem",
        full: "9999px",
      },
      backgroundImage: {
        "jobdhari-gradient":
          "linear-gradient(90deg, #E57973 0%, #0D2C54 100%)",
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};

export default config;
