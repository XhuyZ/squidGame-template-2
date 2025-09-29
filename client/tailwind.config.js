
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        squid: {
          pink: '#FF007A',
          green: '#00B8A9',
          dark: '#0D0D0D',
          gray: '#222222',
          light: '#F5F5F5',
        }
      },
      fontFamily: {
        'display': ['"Chakra Petch"', 'sans-serif'],
        'pixel': ['"Press Start 2P"', 'cursive'],
      },
      keyframes: {
        flash: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.2 },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' },
        },
        rope: {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(var(--tw-translate-x))' },
        }
      },
      animation: {
        flash: 'flash 0.5s ease-in-out',
        shake: 'shake 0.5s ease-in-out',
        rope: 'rope 1s ease-in-out forwards',
      },
    },
  },
  plugins: [],
}
