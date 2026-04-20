/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        heading: ['Sora', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 10px 30px rgba(14, 32, 53, 0.08)',
      },
      colors: {
        brand: {
          50: '#f0f8ff',
          100: '#dbeefe',
          500: '#0c7bb3',
          700: '#0a577f',
          900: '#07344d',
        },
      },
    },
  },
  plugins: [],
}

