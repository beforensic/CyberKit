/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2B6CB0',
          50: '#EBF4FF',
          100: '#D6E9FF',
          200: '#A3CFFF',
          300: '#70B5FF',
          400: '#4D9BE8',
          500: '#2B6CB0',
          600: '#225A94',
          700: '#1A4878',
          800: '#12365C',
          900: '#0A2440',
        },
        accent: {
          DEFAULT: '#ED8936',
          50: '#FFF5EB',
          100: '#FFE8D1',
          200: '#FFD1A3',
          300: '#FFB975',
          400: '#FFA247',
          500: '#ED8936',
          600: '#C96E1F',
          700: '#A55616',
          800: '#813E0F',
          900: '#5D2608',
        },
      },
    },
  },
  plugins: [],
};
