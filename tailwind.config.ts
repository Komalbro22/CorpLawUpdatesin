import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      boxShadow: {
        card: '0 1px 2px rgba(15, 23, 42, 0.06), 0 4px 12px rgba(15, 23, 42, 0.04)',
        'card-hover': '0 4px 6px rgba(15, 23, 42, 0.05), 0 12px 24px rgba(15, 23, 42, 0.06)',
        nav: '0 1px 0 rgba(15, 23, 42, 0.06), 0 4px 16px rgba(15, 23, 42, 0.04)',
      },
      typography: {
        DEFAULT: {
          css: {
            '--tw-prose-body': '#334155',
            '--tw-prose-headings': '#0F172A',
            '--tw-prose-bold': '#0F172A',
            maxWidth: 'none',
          },
        },
      },
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
        heading: ['var(--font-lora)', 'Georgia', 'serif'],
        body: ['var(--font-source-sans)', 'Arial', 'sans-serif'],
        sans: ['var(--font-source-sans)', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
export default config
