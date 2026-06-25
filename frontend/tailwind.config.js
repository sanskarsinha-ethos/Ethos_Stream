/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ethos: {
          bg: '#0A0F1E',
          surface: '#151C2C',
          elevated: '#1F2937',
          border: '#374151',
          teal: '#00E5CC',
          'teal-dim': 'rgba(0, 229, 204, 0.1)',
          amber: '#F59E0B',
          'amber-dim': 'rgba(245, 158, 11, 0.1)',
          white: '#FFFFFF',
          muted: '#9CA3AF',
          danger: '#EF4444',
          success: '#10B981',
        }
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        space: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
