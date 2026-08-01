import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        potentia: {
          deep: "#123528",
          deepDark: "#0c2a1e",
          lime: "#9CC26B",
          limeDark: "#7FAA4E",
          lavender: "#D9CBEA",
          lavenderDark: "#C3AEDD",
          cream: "#FBF7F0",
          sand: "#F3ECE0",
          ink: "#1E2622",
          muted: "#5B655F",
        },
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "Segoe UI", "Helvetica", "Arial", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      boxShadow: {
        soft: "0 8px 30px -12px rgba(18, 53, 40, 0.18)",
        card: "0 2px 12px -4px rgba(18, 53, 40, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
