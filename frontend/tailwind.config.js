/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep, Trustworthy Indigo (Primary)
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1', // Vibrant Indigo
          600: '#4f46e5', // Brand Lead
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        // Fresh Emerald (For Impact, Success, and Points)
        accent: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981', // Impact Green
          600: '#059669',
          700: '#047857',
        },
        // Warm Neutrals (Instead of pure gray)
        surface: {
          50: '#fafaf9', // Warm White
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          900: '#1c1917', // Stone Black
        },
        // Your requested cream colors, refined
        cream: {
          50: '#fffcf2',
          100: '#fff9e6',
          200: '#fef3c7',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0))',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'indigo-glow': '0 0 20px rgba(79, 70, 229, 0.15)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-20px 0' },
          '100%': { backgroundPosition: '20px 0' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s infinite linear',
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide')
  ],
}