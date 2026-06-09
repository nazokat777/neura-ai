import type { MetadataRoute } from 'next';

// Statik eksport (output: 'export') uchun majburiy.
export const dynamic = 'force-static';

const BASE = 'https://neyron-ai.vercel.app';

// Qidiruv robotlari uchun: hammasiga ruxsat + sitemap manzili.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
