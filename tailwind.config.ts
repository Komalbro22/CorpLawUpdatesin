import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      boxShadow: {
        card: '0 1px 2px rgba(15, 23, 42, 0.06), 0 4px 12px rgba(15, 23, 42, 0.04)',
        'card-hover': '0 4px 6px rgba(15, 23, 42, 0.05), 0 16px 32px rgba(15, 23, 42, 0.08)',
        nav: '0 1px 0 rgba(15, 23, 42, 0.06), 0 4px 16px rgba(15, 23, 42, 0.04)',
        'glow-gold': '0 0 20px rgba(245, 158, 11, 0.25), 0 4px 12px rgba(245, 158, 11, 0.15)',
        'glow-gold-sm': '0 0 10px rgba(245, 158, 11, 0.20)',
        'inner-gold': 'inset 0 0 0 1px rgba(245, 158, 11, 0.25)',
        admin: '0 1px 3px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.15)',
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
          mca:  '#3B82F6',
          sebi: '#10B981',
          rbi:  '#8B5CF6',
          nclt: '#F97316',
          ibc:  '#EF4444',
          fema: '#14B8A6',
        },
      },
      fontFamily: {
        heading: ['var(--font-lora)',        'Georgia', 'serif'],
        body:    ['var(--font-source-sans)', 'Arial',   'sans-serif'],
        sans:    ['var(--font-source-sans)', 'Arial',   'sans-serif'],
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.22, 0.68, 0, 1.2)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)'    },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'slide-in-left': {
          from: { opacity: '0', transform: 'translateX(-16px)' },
          to:   { opacity: '1', transform: 'translateX(0)'      },
        },
        'pulse-soft': {
          '0%,100%': { opacity: '1'   },
          '50%':     { opacity: '0.7' },
        },
      },
      animation: {
        'fade-up':       'fade-up 0.4s ease-out both',
        'fade-in':       'fade-in 0.3s ease-out both',
        'slide-in-left': 'slide-in-left 0.3s cubic-bezier(0.22, 0.68, 0, 1.2) both',
        'pulse-soft':    'pulse-soft 2s ease-in-out infinite',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
export default config
