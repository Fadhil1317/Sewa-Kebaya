/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'batik-brown': '#3E2723',
        'batik-gold': '#D4AF37',
        'batik-cream': '#FFFDD0',
      },
    },
  },
  plugins: [],
}