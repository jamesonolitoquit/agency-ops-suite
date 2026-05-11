import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#f7f7f8",
          100: "#ececee",
          200: "#d5d7dc",
          300: "#adb2bc",
          400: "#7b8392",
          500: "#596070",
          600: "#424958",
          700: "#2f3542",
          800: "#1d2230",
          900: "#111522"
        },
        accent: {
          50: "#f4f8ff",
          100: "#e3eeff",
          200: "#bfd6ff",
          300: "#8eb6ff",
          400: "#5c92ff",
          500: "#2f6ef0",
          600: "#2253c2"
        }
      },
      boxShadow: {
        glow: "0 20px 60px rgba(47, 110, 240, 0.18)"
      }
    }
  },
  plugins: []
};

export default config;