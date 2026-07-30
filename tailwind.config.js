/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Source Serif 4"', 'Georgia', 'serif'],
      },
      borderRadius: {
        card: '1.5rem',
        panel: '2rem',
      },
      colors: {
        surface: {
          dark: '#0F172A',
          light: '#FAFAFA',
          deep: '#020617',
        },
        'brand-orange': {
          DEFAULT: '#E8650A',
          50: '#FEF3EC',
          100: '#FDE8D7',
          200: '#FBCFAD',
          300: '#F7A872',
          400: '#F08040',
          500: '#E8650A',
          600: '#C95508',
          700: '#A84406',
          800: '#873504',
          900: '#5D2608',
        },
      },
    },
  },
  plugins: [],
};
