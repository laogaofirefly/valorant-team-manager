/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'valorant': {
          'red': '#FF4655',
          'red-dark': '#BD3944',
          'red-light': '#FF6B7A',
          'dark': '#0F1115',
          'darker': '#08090B',
          'panel': '#11141A',
          'panel-light': '#1A1E26',
          'purple': '#6C5CE7',
          'cyan': '#00D9FF',
          'teal': '#00E5C4',
          'gold': '#FFD700',
          'silver': '#C0C0C0',
          'bronze': '#CD7F32',
        },
        'vct': {
          'stage': '#00D9FF',
          'masters': '#FFD700',
          'champions': '#FF4655',
          'challengers': '#6C5CE7',
          'game-changers': '#EC4899',
        }
      },
      fontFamily: {
        'display': ['Oswald', 'Noto Sans SC', 'sans-serif'],
        'tactical': ['Rajdhani', 'Noto Sans SC', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'flash': 'flash 0.4s ease-out',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 70, 85, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(255, 70, 85, 0.8)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'flash': {
          '0%': { backgroundColor: 'rgba(255, 70, 85, 0.3)' },
          '100%': { backgroundColor: 'transparent' },
        }
      }
    },
  },
  plugins: [],
}
