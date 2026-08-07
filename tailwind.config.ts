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
        background: "#0D0F12",
        card: "#15181E",
        border: "#262B35",
        accent: {
          lime: "#E2FF54",
          yellow: "#FFE600",
          pink: "#FF5470",
          cyan: "#00F0FF",
          orange: "#FF8A00",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        brutal: "4px 4px 0px 0px #E2FF54",
        "brutal-black": "4px 4px 0px 0px #000000",
        "brutal-pink": "4px 4px 0px 0px #FF5470",
        "brutal-cyan": "4px 4px 0px 0px #00F0FF",
        "glow-lime": "0 0 20px rgba(226, 255, 84, 0.35)",
        "glow-pink": "0 0 20px rgba(255, 84, 112, 0.35)",
      },
    },
  },
  plugins: [],
};
export default config;
