import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'brand-dark': '#0A192F',
        'brand-text': '#E5E7EB',
        'brand-accent': '#22D3EE',
        'brand-blue': '#3B82F6',
      },
      boxShadow: {
        soft: '0 20px 45px rgba(15,23,42,0.15)',
        glow: '0 0 20px rgba(34, 211, 238, 0.1)',
      },
    },
  },
  plugins: [],
};

export default config;
