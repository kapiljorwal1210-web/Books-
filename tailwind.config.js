/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        sepia: {
          50: '#FDFBF7',
          100: '#F9F5EB',
          200: '#F4ECD8',
          300: '#EADFC6',
          700: '#5C4033',
          800: '#432E27',
          900: '#2C1D18'
        }
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['Menlo', 'Monaco', 'Consolas', '"Courier New"', 'monospace']
      }
    }
  },
  plugins: []
};
