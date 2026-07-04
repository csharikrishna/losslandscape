import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        void: {
          DEFAULT: "#05070C",
          soft: "#080B14",
          panel: "#0D1220",
          line: "#1B2333",
        },
        ink: {
          DEFAULT: "#EDEFF5",
          dim: "#B4BACC",
          faint: "#7B8299",
        },
        elevation: {
          low: "#2E6FF2",
          midlow: "#22B8B0",
          mid: "#F2C14E",
          high: "#F2542D",
        },
        signal: {
          DEFAULT: "#8FF7E0",
          dim: "#4FB8A6",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      backgroundImage: {
        "elevation-ramp":
          "linear-gradient(90deg, #2E6FF2 0%, #22B8B0 33%, #F2C14E 66%, #F2542D 100%)",
        "void-radial":
          "radial-gradient(120% 120% at 50% 0%, #0D1220 0%, #05070C 60%)",
      },
      letterSpacing: {
        tightest: "-0.04em",
        widest2: "0.28em",
      },
      transitionTimingFunction: {
        terrain: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      animation: {
        shimmer: "shimmer 8s linear infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
