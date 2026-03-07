/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#1e1e2e',
          alt: '#181825',
          raised: '#313244',
        },
        accent: {
          blue: '#89b4fa',
          green: '#a6e3a1',
          yellow: '#f9e2af',
          red: '#f38ba8',
          purple: '#cba6f7',
          cyan: '#89dceb',
          orange: '#fab387',
        },
        text: {
          primary: '#cdd6f4',
          muted: '#6c7086',
          dim: '#45475a',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
