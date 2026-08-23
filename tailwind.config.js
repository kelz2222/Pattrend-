/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: '#0a0e14',
        panel: '#0f1420',
        border: '#1c2230',
        bull: '#26a17b',
        bear: '#e5484d',
        accent: '#22c98d',
        pending: '#e8b339',
      },
    },
  },
  plugins: [],
}
