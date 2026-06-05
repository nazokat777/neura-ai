'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { loadName } from '@/lib/storage';

// Ro'yhatdan o'tganda kiritilgan ism bo'lsa, uy sahifasida salomlaydi.
// Ism yo'q bo'lsa — hech narsa ko'rsatmaydi (joy egallamaydi).
export default function Greeting() {
  const t = useTranslations('home');
  const [name, setName] = useState('');

  useEffect(() => {
    setName(loadName());
  }, []);

  if (!name) return null;

  return (
    <span
      className="animate-rise text-[15px] font-medium text-ink/90"
      style={{ animationDelay: '40ms' }}
    >
      {t('greeting', { name })}
    </span>
  );
}
