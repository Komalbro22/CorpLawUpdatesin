import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#0F172A',
        gold: '#F59E0B',
        category: {
          mca: '#3B82F6',
          sebi: '#10B981',
          rbi: '#8B5CF6',
          nclt: '#F97316',
          ibc: '#EF4444',
          fema: '#14B8A6',
        },
      },
      fontFamily: {
        heading: ['Lora', 'Georgia', 'serif'],
        body: ['Source Sans 3', 'sans-serif'],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
export default config
