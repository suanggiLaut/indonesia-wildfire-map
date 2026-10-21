import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        fire: {
          low: "#fbbf24",
          moderate: "#f59e0b",
          high: "#ef4444",
          vhigh: "#dc2626",
          extreme: "#991b1b",
        },
        terminal: {
          bg: "#0a0a0a",
          surface: "#111111",
          border: "#1e1e1e",
          text: "#d4d4d4",
          muted: "#737373",
          accent: "#22c55e",
          orange: "#f97316",
          red: "#ef4444",
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
