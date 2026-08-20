import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0B0C0A",
        surface: "#15170F",
        surface2: "#1D2016",
        paper: "#EDEAE0",
        muted: "#8A8C7D",
        line: "#2A2C22",
        gold: "#C9A227",
        olive: "#7C8363",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
