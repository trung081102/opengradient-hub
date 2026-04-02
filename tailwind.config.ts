import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        og: {
          dark: '#0A0A0F',
          darker: '#06060A',
          card: '#12121A',
          border: '#1E1E2E',
          'border-light': '#2A2A3E',
          purple: '#8B5CF6',
          'purple-light': '#A78BFA',
          'purple-dark': '#7C3AED',
          teal: '#00D4AA',
          'teal-light': '#2EE6C0',
          'teal-dark': '#00B894',
          blue: '#3B82F6',
          orange: '#F59E0B',
          red: '#EF4444',
          green: '#10B981',
          text: '#E5E7EB',
          'text-secondary': '#9CA3AF',
          'text-muted': '#6B7280',
          surface: '#F6F7F8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
};
export default config;
