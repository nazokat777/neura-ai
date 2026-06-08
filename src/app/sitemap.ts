import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { CATALOG } from '@/lib/catalog';

// Statik eksport (output: 'export') uchun majburiy.
export const dynamic = 'force-static';

// Jonli URL. Keyinchalik custom domen (neura.app) olinsa — shu yerni o'zgartiring.
const BASE = 'https://neura-ai.vercel.app';

// Google/qidiruv tizimlari uchun sayt xaritasi — barcha asosiy sahifalar,
// har til (uz/ru/en) bo'yicha. Mashqlar (drills) flow sahifalari emas, shu bois
// indeksga asosiy navigatsiya sahifalarini kiritamiz.
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    '', // bosh sahifa
    '/games',
    '/insights',
    '/intro',
    ...CATALOG.map((c) => `/games/${c.id}`),
  ];

  const entries: MetadataRoute.Sitemap = [];
  for (const locale of routing.locales) {
    for (const path of paths) {
      entries.push({
        url: `${BASE}/${locale}${path}`,
        changeFrequency: 'weekly',
        priority: path === '' ? 1 : 0.7,
      });
    }
  }
  return entries;
}
