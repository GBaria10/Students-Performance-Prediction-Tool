/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
        body: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif']
      },
      colors: {
        primary: '#2563eb',
        accent: '#0ea5e9',
        success: '#22c55e',
        danger: '#ef4444',
        muted: '#6b7280'
      },
      boxShadow: {
        card: '0 15px 50px -12px rgba(37, 99, 235, 0.18)',
        subtle: '0 10px 30px -14px rgba(15, 23, 42, 0.25)'
      }
    },
  },
  plugins: [],
};
