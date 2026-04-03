/** @type {import('tailwindcss').Config} */
module.exports = {
  future: {
    hoverOnlyWhenSupported: true,
  },
  content: [
    './layout/**/*.liquid',
    './sections/**/*.liquid',
    './snippets/**/*.liquid',
    './templates/**/*.liquid',
    './src/**/*.js',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'Noto Sans JP', 'sans-serif'],
      },
      colors: {
        background: 'var(--color-background)',
        surface:    'var(--color-surface)',
        muted:      'var(--color-muted)',
        text: {
          DEFAULT: 'var(--color-text)',
          muted:   'var(--color-text-muted)',
          subtle:  'var(--color-text-subtle)',
        },
        dark:       'var(--color-dark)',
        accent:     'var(--color-accent)',
        premium:    'var(--color-premium)',
        'rank-text':'var(--color-rank-text)',
        info:       'var(--color-info)',
        sale:       'var(--color-sale)',
      },
    },
  },
  plugins: [],
}
