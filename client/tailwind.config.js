/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        eyra: {
          bg: '#101111',
          surface: '#151616',
          card: '#191a1a',
          popover: '#202222',
          border: '#343636',
          input: '#383b38',
          muted: '#252727',
          'muted-fg': '#9d9f9e',
          primary: '#d6f779',
          'primary-hover': '#c3e665',
          'primary-fg': '#101111',
        },
        dark: {
          DEFAULT: '#101111',
          surface: '#151616',
          card: '#191a1a',
          border: '#343636',
          hover: '#242626',
        },
        oled: {
          DEFAULT: '#101111',
          surface: '#151616',
          card: '#191a1a',
          border: '#343636',
          hover: '#242626',
        },
        cyber: {
          cyan: '#00F2FE',
          blue: '#4FACFE',
          indigo: '#6366F1',
          purple: '#8B5CF6',
          emerald: '#10B981',
          rose: '#F43F5E',
          amber: '#F59E0B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
