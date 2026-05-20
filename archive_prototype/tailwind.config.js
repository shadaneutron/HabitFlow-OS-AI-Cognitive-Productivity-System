module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        background: '#FFFFFF',
        surface: '#F7F9FC',
        border: '#E2E8F0',
        success: '#A7F3D0',
        successDark: '#059669',
        focus: '#BFDBFE',
        focusDark: '#2563EB',
        urgency: '#FDE68A',
        textDark: '#0F172A',
        textMuted: '#64748B',
        slate: {
          50: '#F7F9FC',
          100: '#f1f5f9',
          200: '#E2E8F0',
        }
      },
      animation: {
        'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shrink-x': 'shrink-x 5s linear forwards',
        'slide-up': 'slide-up 0.4s ease-out forwards',
      },
      keyframes: {
        'shrink-x': {
          '0%': { width: '100%' },
          '100%': { width: '0%' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}