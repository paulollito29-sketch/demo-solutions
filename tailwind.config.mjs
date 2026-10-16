/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        benny: {
          purple: '#512680',
          'purple-dark': '#3F1C64',
          'purple-light': '#6B35A8',
          pink: '#EF91BC',
          'pink-soft': '#FDF2F7',
          lilac: '#C084FC',
          lavender: '#F5EEF9',
          bg: '#FAF7FC',
          ink: '#1F142B',
          'ink-muted': '#6B5E78',
          border: '#E8DEF0',
          green: '#166534'
        }
      },
      fontFamily: {
        editorial: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        script: ['"Dancing Script"', 'cursive'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        'mono-price': ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
