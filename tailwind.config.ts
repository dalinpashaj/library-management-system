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
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        cream: "#FAF7F0",
        surface: "#FFFFFF",
        ink: "#3A2E1F",
        muted: "#8A7B5F",
        divider: "#E5DDC8",
        accent: {
          DEFAULT: "#7A5C3E",
          dark: "#684E35",
        },
        status: {
          reading: "#E9F0E1",
          "reading-text": "#4B6B3A",
          want: "#F3ECDD",
          "want-text": "#8A6D3A",
          completed: "#EFEAF3",
          "completed-text": "#6B4B99",
        },
      },
      fontFamily: {
        heading: ["var(--font-heading)", "Georgia", "Cambria", "serif"],
        sans: ["var(--font-body)", "ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
