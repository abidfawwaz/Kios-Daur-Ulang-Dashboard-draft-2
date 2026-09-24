/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bsi: {
          teal: {
            DEFAULT: '#00A39D',
            50: '#F0FDFA',
            100: '#CCFBF1',
            200: '#99F6E4',
            300: '#5EEAD4',
            400: '#2DD4BF',
            500: '#00A39D',
            600: '#0D9488',
            700: '#0F766E',
            800: '#115E59',
            900: '#134E4A',
            dark: '#007A75',
          },
          gold: {
            DEFAULT: '#F8AD3C',
            50: '#FFFBEB',
            100: '#FEF3C7',
            200: '#FDE68A',
            300: '#FCD34D',
            400: '#FBBF24',
            500: '#F8AD3C',
            600: '#D97706',
            700: '#B45309',
            800: '#92400E',
            900: '#78350F',
          },
          navy: '#0B2341',
          slate: '#1E293B',
          lightbg: '#F8FAFB',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Lato', 'Inter', 'sans-serif'],
        corporate: ['Lato', 'sans-serif'],
      },
      boxShadow: {
        'bsi': '0 4px 20px -2px rgba(0, 163, 157, 0.12), 0 2px 6px -1px rgba(0, 163, 157, 0.08)',
        'bsi-gold': '0 4px 20px -2px rgba(248, 173, 60, 0.15)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'elevated': '0 10px 25px -5px rgba(0, 0, 0, 0.06), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
