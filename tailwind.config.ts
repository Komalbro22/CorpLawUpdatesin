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
        'admin-glass': '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
        'admin-card': '0 4px 24px -2px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.05)',
        'admin-card-hover': '0 8px 40px -4px rgba(0,0,0,0.35), 0 0 0 1px rgba(245,158,11,0.15)',
        'admin-glow-amber': '0 0 20px rgba(245,158,11,0.15), 0 0 40px rgba(245,158,11,0.05)',
        'admin-glow-emerald': '0 0 20px rgba(16,185,129,0.15), 0 0 40px rgba(16,185,129,0.05)',
        'admin-glow-blue': '0 0 20px rgba(59,130,246,0.15), 0 0 40px rgba(59,130,246,0.05)',
        'admin-glow-violet': '0 0 20px rgba(139,92,246,0.15), 0 0 40px rgba(139,92,246,0.05)',
        'a4': '0 4px 32px rgba(0,0,0,0.18)',
      },
      borderRadius: {
        'card': '12px',
        'badge': '6px',
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
        // Add dark mode specific colors
        'dark-bg': '#0A0F1E',
        'dark-surface': '#111827',
        'dark-card': '#1E2433',
        'dark-border': '#2D3748',
        'dark-text': '#E2E8F0',
        'dark-text-muted': '#94A3B8',
        category: {
          mca:  '#3B82F6',
          sebi: '#10B981',
          rbi:  '#8B5CF6',
          nclt: '#F97316',
          ibc:  '#EF4444',
          fema: '#14B8A6',
        },
        brand: {
          navy:       '#0B1F3A',  // Primary dark background
          'slate-blue': '#1E3A5F', // Secondary backgrounds, cards
          'mid-blue':   '#2E5F8A', // Interactive elements
          gold:         '#C9A84C', // Accent, CTAs, highlights
          'gold-light': '#E8C97D', // Hover states for gold
          cream:        '#F5F0E8', // Light background
          muted:        '#8B9BB4', // Secondary text on dark backgrounds
        },
        status: {
          verified:  '#16A34A',  // Rate badge green
          stale:     '#D97706',  // Rate badge amber
          error:     '#DC2626',  // Rate badge red
          warning:   '#F59E0B',  // Alert cards
        }
      },
      fontFamily: {
        heading: ['var(--font-lora)',        'Georgia', 'serif'],
        body:    ['var(--font-source-sans)', 'Arial',   'sans-serif'],
        sans:    ['var(--font-inter)', 'system-ui', 'sans-serif'],
        serif:   ['var(--font-playfair)', 'Georgia', 'serif'],
        mono:    ['var(--font-jetbrains-mono)', 'monospace'],
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
        'admin-shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0'  },
        },
        'admin-float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
        'admin-glow-pulse': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 15px rgba(245,158,11,0.2)' },
          '50%':      { opacity: '0.8', boxShadow: '0 0 25px rgba(245,158,11,0.35)' },
        },
        'admin-border-glow': {
          '0%, 100%': { borderColor: 'rgba(245,158,11,0.3)' },
          '50%':      { borderColor: 'rgba(245,158,11,0.6)' },
        },
      },
      animation: {
        'fade-up':       'fade-up 0.4s ease-out both',
        'fade-in':       'fade-in 0.3s ease-out both',
        'slide-in-left': 'slide-in-left 0.3s cubic-bezier(0.22, 0.68, 0, 1.2) both',
        'pulse-soft':    'pulse-soft 2s ease-in-out infinite',
        'admin-shimmer': 'admin-shimmer 2.5s ease-in-out infinite',
        'admin-float':   'admin-float 5s ease-in-out infinite',
        'admin-glow':    'admin-glow-pulse 3s ease-in-out infinite',
        'admin-border':  'admin-border-glow 3s ease-in-out infinite',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
export default config
