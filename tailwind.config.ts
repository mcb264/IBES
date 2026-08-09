import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        graphite: "#1B1B1D",
        panel: "#242427",
        panelLight: "#2D2D30",
        amber: "#E8A33D",
        alert: "#D6432B",
        teal: "#4FA792",
        ink: "#EDEAE3",
        muted: "#8B8B90",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
    },
  },
  plugins: [],
};
export default config;
