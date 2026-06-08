import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brend palitrasi (CLAUDE.md §1)
        bg: '#06080F',
        surface: '#0C1018',
        surface2: '#141A26',
        line: '#1E2633',
        ink: '#ECEFF7',
        muted: '#9CA7BC',
        // Brend urg'u — logo ranglari: elektr ko'k (chap) + siyohrang (o'ng)
        accent: '#4D8DFF',
        'accent-dim': '#2D5BD0',
        accent2: '#B06CFF',
        'accent2-dim': '#7B3FD0',
        // Holat ranglari (xato/noto'g'ri feedback) — token, hard-code emas
        danger: '#FF6B6B',
        'danger-dim': '#5A2330',
      },
      fontFamily: {
        // Display: editorial serif italic urg'u. Body: toza grotesk (§8).
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        tightest: '-0.04em',
      },
      lineHeight: {
        display: '0.95',
      },
    },
  },
  plugins: [],
};

export default config;
