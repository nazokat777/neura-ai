'use client';

import { useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { isOnboarded } from '@/lib/storage';

// Birinchi ochilishda foydalanuvchini cinematic introga yo'naltiradi.
// Onboardingdan o'tgan bo'lsa — hech narsa qilmaydi (home ko'rinadi).
export default function OnboardingGate() {
  const router = useRouter();
  useEffect(() => {
    if (!isOnboarded()) router.replace('/intro');
  }, [router]);
  return null;
}
