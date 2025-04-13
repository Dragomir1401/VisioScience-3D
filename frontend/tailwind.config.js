/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        melon: "#DAA89B",
        rosy: "#AE847E",
        darkPurple: "#2C0E37",
        purple: "#690375",
        mulberry: "#CB429F",
        lavender: "#E6E6FA",
        mulberry: "#C96480",
        "rosy-brown": "#BC8F8F",

        gray: {
          200: "#D5DAE1"
        },
        black: {
          DEFAULT: "#000",
          500: "#1D2235"
        },
        blue: {
          500: "#2b77e7"
        }
      },

      backgroundImage: {
        'pink-purple-gradient': 'linear-gradient(90deg, #690375, #CB429F)',
        'blue-gradient': 'linear-gradient(90deg, #1e3a8a, #3b82f6)',
      },

      fontFamily: {
        worksans: ["Work Sans", "sans-serif"],
        poppins: ['Poppins', "sans-serif"]
      },

      boxShadow: {
        card: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)'
      },
    },
  },
  plugins: [],
}
