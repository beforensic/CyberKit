/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#2B6CB0', 50: '#EBF4FF', 500: '#2B6CB0', 900: '#0A2440' },
        accent: { DEFAULT: '#ED8936', 500: '#ED8936', 900: '#5D2608' },
      },
    },
  },
  plugins: [],
};