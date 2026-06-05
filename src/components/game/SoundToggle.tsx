'use client';

import { useEffect, useState } from 'react';
import { isSoundOn, setSoundOn } from '@/lib/feedback';

// Ovoz/haptic'ни yoqish-o'chirish. Holat localStorage'да saqlanadi.
export default function SoundToggle() {
  const [on, setOn] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setOn(isSoundOn());
    setMounted(true);
  }, []);

  if (!mounted) return <span className="w-9" aria-hidden />;

  return (
    <button
      onClick={() => {
        const next = !on;
        setOn(next);
        setSoundOn(next);
      }}
      aria-label={on ? 'Ovozni o‘chirish' : 'Ovozni yoqish'}
      aria-pressed={on}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-base text-muted transition-colors hover:border-accent hover:text-accent active:scale-90"
    >
      {on ? '♪' : '✕'}
    </button>
  );
}
