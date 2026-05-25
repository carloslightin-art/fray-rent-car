/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        luxuryBlack: '#050505',
        luxuryPanel: '#0e0e0e',
        luxurySoft: '#141414',
        luxuryGold: '#d4af37',
        luxuryGoldSoft: '#b8932f',
        luxuryText: '#f5f1e8',
        luxuryMuted: '#9ca3af',
        luxurySuccess: '#16a34a',
        luxuryWarning: '#d97706',
        luxuryDanger: '#dc2626'
      },
      boxShadow: {
        panel: '0 10px 30px rgba(0,0,0,0.35)',
        gold: '0 10px 35px rgba(212,175,55,0.18)'
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #d4af37 0%, #b8932f 100%)'
      }
    }
  },
  plugins: []
}
