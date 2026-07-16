import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"]
      },
      colors: {
        background: "#F7F8FA",
        primary: {
          DEFAULT: "#245B68",
          foreground: "#FFFFFF",
          soft: "#E5F0F2"
        },
        secondary: {
          DEFAULT: "#5F9E8C",
          foreground: "#FFFFFF",
          soft: "#EAF4F1"
        },
        ink: {
          DEFAULT: "#1F2937",
          muted: "#6B7280"
        },
        border: "#E5E7EB",
        card: "#FFFFFF",
        destructive: "#B42318",
        warning: "#B7791F",
        success: "#2F7D63"
      },
      borderRadius: {
        lg: "14px",
        md: "12px",
        sm: "10px"
      },
      boxShadow: {
        soft: "0 14px 40px rgba(31, 41, 55, 0.06)",
        line: "0 1px 0 rgba(31, 41, 55, 0.05)"
      }
    }
  },
  plugins: [animate]
};

export default config;
