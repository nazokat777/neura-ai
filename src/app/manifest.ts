import type { MetadataRoute } from 'next';

// Statik eksport (output: 'export') uchun majburiy.
export const dynamic = 'force-static';

// PWA manifest — desktop/mobil brauzerda o'rnatiladigan ilova.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Neura AI — Brain Training',
    short_name: 'Neura AI',
    description: 'Neura AI — brain training games: memory, attention, logic, speed, focus. Improve yourself every day.',
    start_url: '/en/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#06080F',
    theme_color: '#06080F',
    icons: [
      { src: '/logo-mark.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/logo-mark.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
