/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FFEBEE',
          100: '#FFCDD2',
          200: '#EF9A9A',
          300: '#E57373',
          400: '#EF5350',
          500: '#E53935',
          600: '#D32F2F',
          700: '#C62828', // Deep Red
          800: '#B71C1C',
          900: '#8E0000',
        },
        charcoal: {
          DEFAULT: '#202020',
          50: '#F5F5F5',
          100: '#E0E0E0',
          200: '#CCCCCC',
          300: '#999999',
          400: '#666666',
          500: '#333333',
          600: '#282828',
          700: '#202020',
          800: '#181818',
          900: '#101010',
        },
        fresh: {
          50: '#E8F5E9',
          100: '#C8E6C9',
          500: '#4CAF50',
          600: '#388E3C',
          700: '#2E7D32', // Fresh Green
          800: '#1B5E20',
        },
        warm: '#FAFAFA'
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
