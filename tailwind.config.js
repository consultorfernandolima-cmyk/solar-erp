/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#061428',
          900: '#0a1f3d',
          800: '#0f2d54',
          700: '#163e6e',
          600: '#1e528c',
        },
        solar: {
          yellow: '#f5c518',
          gold: '#e8b923',
          green: '#3dba7a',
          mint: '#6ee7a8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 10px 40px -12px rgba(6, 20, 40, 0.18)',
      },
    },
  },
  plugins: [],
}
