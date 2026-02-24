/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'shake': 'shake 0.5s infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'falling-segment': 'falling-segment 0.6s ease-in forwards',
        'drip': 'drip 1s ease-in forwards',
        'dripping-blood': 'dripping-blood 2s ease-in forwards',
        'damage-glow': 'damageGlow 0.8s ease-out',
        'horizontal-shake': 'horizontalShake 0.8s ease-out',
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-2px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(2px)' }
        },
        'pulse-glow': {
          '0%, 100%': { 
            boxShadow: '0 0 5px currentColor',
            opacity: '1'
          },
          '50%': { 
            boxShadow: '0 0 20px currentColor',
            opacity: '0.8'
          }
        },
        'falling-segment': {
          '0%': {
            transform: 'translateY(0) rotateZ(0deg)',
            opacity: '1'
          },
          '50%': {
            transform: 'translateY(15px) rotateZ(4deg)',
            opacity: '0.6'
          },
          '100%': {
            transform: 'translateY(30px) rotateZ(6deg)',
            opacity: '0'
          }
        },
        drip: {
          '0%': {
            transform: 'translateY(0)',
            opacity: '1'
          },
          '50%': {
            transform: 'translateY(30px)',
            opacity: '0.8'
          },
          '100%': {
            transform: 'translateY(60px)',
            opacity: '0'
          }
        },
        'dripping-blood': {
          '0%': {
            transform: 'translateY(0) scaleY(1)',
            opacity: '1'
          },
          '10%': {
            transform: 'translateY(5px) scaleY(1.2)',
            opacity: '0.9'
          },
          '30%': {
            transform: 'translateY(20px) scaleY(1.5)',
            opacity: '0.8'
          },
          '50%': {
            transform: 'translateY(40px) scaleY(1.8)',
            opacity: '0.6'
          },
          '70%': {
            transform: 'translateY(70px) scaleY(2)',
            opacity: '0.4'
          },
          '90%': {
            transform: 'translateY(100px) scaleY(2.2)',
            opacity: '0.2'
          },
          '100%': {
            transform: 'translateY(120px) scaleY(2.5)',
            opacity: '0'
          }
        },
        damageGlow: {
          '0%': {
            boxShadow: '0 0 2px rgba(239, 68, 68, 0.2)'
          },
          '30%': {
            boxShadow: '0 0 8px rgba(239, 68, 68, 0.6), 0 0 12px rgba(239, 68, 68, 0.4)'
          },
          '100%': {
            boxShadow: '0 0 2px rgba(239, 68, 68, 0.2)'
          }
        },
        horizontalShake: {
          '0%': { transform: 'translateX(0)' },
          '10%': { transform: 'translateX(-2px)' },
          '20%': { transform: 'translateX(2px)' },
          '30%': { transform: 'translateX(-1px)' },
          '40%': { transform: 'translateX(1px)' },
          '50%': { transform: 'translateX(-1px)' },
          '60%': { transform: 'translateX(1px)' },
          '70%, 100%': { transform: 'translateX(0)' }
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(circle, var(--tw-gradient-stops))',
        'noise': `radial-gradient(circle at 20% 50%, transparent 20%, rgba(255,255,255,0.1) 21%, rgba(255,255,255,0.1) 34%, transparent 35%, transparent),
                  linear-gradient(0deg, rgba(255,255,255,0.05) 50%, transparent 50%)`
      },
      animationDelay: {
        '200': '200ms',
        '300': '300ms',
        '400': '400ms',
        '500': '500ms',
      }
    },
  },
  plugins: [],
}

