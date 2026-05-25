/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        luxuryBlack: '#050505',
        luxurySoftBlack: '#101010',
        luxuryGold: '#D4AF37',
        luxuryGoldSoft: '#B8932F',
        luxuryText: '#F5F1E8',
        luxuryMuted: '#A8A8A8'
      },
      boxShadow: {
        gold: '0 10px 30px rgba(212, 175, 55, 0.25)',
        soft: '0 10px 30px rgba(0,0,0,0.45)'
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #D4AF37 0%, #B8932F 100%)',
        'hero-overlay':
          'radial-gradient(circle at 25% 20%, rgba(212,175,55,0.15), transparent 40%), radial-gradient(circle at 80% 30%, rgba(212,175,55,0.09), transparent 35%)'
      },
      borderRadius: {
        luxury: '1.25rem'
      }
    }
  },
  plugins: []
}
