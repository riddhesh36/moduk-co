import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: "#2C1A1D",
        rose: {
          DEFAULT: "#C4617A",
        },
        pink: {
          DEFAULT: "#E8A0B0",
        },
        blush: {
          DEFAULT: "#FDF0F3",
        },
        cream: {
          DEFAULT: "#FDF8F0",
        },
        "text-body": "#333333",
        "text-muted": "#777777",
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        playfair: ["var(--font-playfair)", "serif"],
        dmsans: ["var(--font-dm-sans)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
