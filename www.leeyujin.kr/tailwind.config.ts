import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Background
        background: "var(--background)",
        "background-soft": "var(--background-soft)",
        surface: "var(--surface)",
        "surface-hover": "var(--surface-hover)",
        
        // Text
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-muted": "var(--text-muted)",
        
        // Border
        border: "var(--border)",
        "border-subtle": "var(--border-subtle)",
        
        // Accent
        accent: "var(--accent-primary)",
        "accent-primary": "var(--accent-primary)",
        "accent-secondary": "var(--accent-secondary)",
        "accent-glow": "var(--accent-glow)",
        
        // Status
        "status-success": "var(--status-success)",
        "status-warning": "var(--status-warning)",
        "status-error": "var(--status-error)",
      },
      borderColor: {
        DEFAULT: "var(--border)",
        border: "var(--border)",
      },
      fontFamily: {
        sans: [
          '"Pretendard Variable"',
          'Pretendard',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
      },
      backgroundImage: {
        "gradient-accent-dark": "linear-gradient(135deg, rgba(79,124,255,0.20), rgba(124,141,255,0.08))",
        "gradient-accent-light": "linear-gradient(135deg, rgba(79,124,255,0.15), rgba(124,141,255,0.05))",
      },
    },
  },
  plugins: [],
};
export default config;

