/** @type {import('tailwindcss').Config} */
module.exports = {
  purge: ['./src/**/*.{html,js}'],
  media: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        primary: '#1D4ED8',
        secondary: '#64748B',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}



