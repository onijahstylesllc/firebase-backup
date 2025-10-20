
import type { Config } from 'tailwindcss';

const config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      fontFamily: {
        body: ['var(--font-body)', 'sans-serif'],
        headline: ['var(--font-headline)', 'sans-serif'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'content-in': {
            from: { opacity: '0', transform: 'translateY(8px)' },
            to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
            from: { opacity: '0' },
            to: { opacity: '1' },
        },
        'fade-out': {
            from: { opacity: '1' },
            to: { opacity: '0' },
        },
        'fade-slide-up': {
            from: { opacity: '0', transform: 'translateY(10px)' },
            to: { opacity: '1', transform: 'translateY(0)' },
        },
        'subtle-lift': {
            '0%': { transform: 'translateY(0)', boxShadow: 'var(--tw-shadow)' },
            '100%': { transform: 'translateY(-2px)', boxShadow: 'var(--tw-shadow-lg)' },
        },
        'marquee': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'blink': {
            '0%, 100%': { opacity: '1' },
            '50%': { opacity: '0' },
        },
        'typing-words': {
            '0%, 25%': { content: '"Smarter."' },
            '33%, 58%': { content: '"Faster."' },
            '66%, 91%': { content: '"AI-powered."' },
            '100%': { content: '"Smarter."' },
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'content-in': 'content-in 0.4s ease-out forwards',
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'fade-out': 'fade-out 0.5s ease-out forwards',
        'fade-slide-up': 'fade-slide-up 0.5s ease-out forwards',
        'subtle-lift': 'subtle-lift 0.2s ease-out forwards',
        'marquee': 'marquee 60s linear infinite',
        'typing-words': 'typing-words 9s infinite'
      },
       backdropBlur: {
        sm: '4px',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;

export default config;
