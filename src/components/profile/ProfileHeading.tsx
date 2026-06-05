'use client';

import { useEffect, useState } from 'react';
import { loadName } from '@/lib/storage';

// Profil sarlavhasi: ism kiritilган bo'lsa ismni, aks holda odatdagi matnni
// ko'rsatadi (ism qurilmada saqlanadi — server bilmaydi, shuning uchun client).
export default function ProfileHeading({ fallback }: { fallback: string }) {
  const [name, setName] = useState('');

  useEffect(() => {
    setName(loadName());
  }, []);

  return (
    <h2
      className="t-display animate-rise"
      style={{
        animationDelay: '80ms',
        fontSize: 'clamp(2.2rem, 9vw, 3rem)',
        lineHeight: '0.95',
        letterSpacing: '-0.04em',
      }}
    >
      {name || fallback}
    </h2>
  );
}
