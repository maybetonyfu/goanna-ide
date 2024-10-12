/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    fontFamily: {
      'sans': ['Poppins', 'ui-sans-serif', 'system-ui'],
      'serif': ['ui-serif', 'Georgia'],
      'mono': ['"Roboto Mono"', 'ui-monospace', 'SFMono-Regular'],
      'body': ['"Open Sans"']
    },
    extend: {},
  },
  plugins: [require('daisyui')],
}

