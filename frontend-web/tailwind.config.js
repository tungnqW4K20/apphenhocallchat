/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          pink: '#FF4458',
          rose: '#FD297B',
          orange: '#FF655B',
          purple: '#7928CA',
          neon: '#00F5D4',
          dark: '#0F0E17',
          darker: '#09080E',
          card: '#16161E',
          surface: '#201F2D'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar': 'radar 2s ease-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'bounce-subtle': 'bounceSubtle 2s infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        radar: {
          '0%': { transform: 'scale(0.8)', opacity: '0.9' },
          '100%': { transform: 'scale(2.5)', opacity: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        glow: {
          'from': { boxShadow: '0 0 10px rgba(253, 41, 123, 0.4), 0 0 20px rgba(255, 68, 88, 0.2)' },
          'to': { boxShadow: '0 0 25px rgba(253, 41, 123, 0.8), 0 0 45px rgba(255, 68, 88, 0.5)' }
        }
      }
    },
  },
  plugins: [],
}
