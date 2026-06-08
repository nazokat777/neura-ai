'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { loadName, saveName } from '@/lib/storage';

// Profil sarlavhasi: ism kiritilган bo'lsa ismni, aks holda odatdagi matnni
// ko'rsatadi. Yonidagi qalam tugmasi bilan ismni tahrirlash mumkin (akkauntni
// o'chirmasdan). Ism qurilmada saqlanadi (localStorage) — server bilmaydi.
export default function ProfileHeading({ fallback }: { fallback: string }) {
  const t = useTranslations('profile');
  const [name, setName] = useState('');
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(loadName());
  }, []);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  function startEdit() {
    setDraft(name);
    setEditing(true);
  }

  function save() {
    const v = draft.trim();
    saveName(v);
    setName(v);
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="animate-rise flex flex-col gap-3">
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') save();
            if (e.key === 'Escape') setEditing(false);
          }}
          maxLength={32}
          placeholder={t('namePlaceholder')}
          className="t-display w-full rounded-2xl border border-line bg-surface/60 px-4 py-2 text-ink outline-none focus:border-accent"
          style={{ fontSize: 'clamp(1.6rem, 7vw, 2.2rem)', letterSpacing: '-0.03em' }}
        />
        <div className="flex gap-3">
          <button
            onClick={save}
            className="rounded-full bg-accent px-6 py-2.5 text-[14px] font-medium text-bg active:scale-95"
          >
            {t('save')}
          </button>
          <button
            onClick={() => setEditing(false)}
            className="rounded-full border border-line px-6 py-2.5 text-[14px] text-muted active:scale-95"
          >
            {t('cancel')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <h2
        className="t-display animate-rise min-w-0 flex-1 truncate"
        style={{
          animationDelay: '80ms',
          fontSize: 'clamp(2.2rem, 9vw, 3rem)',
          lineHeight: '0.95',
          letterSpacing: '-0.04em',
        }}
      >
        {name || fallback}
      </h2>
      <button
        onClick={startEdit}
        aria-label={t('editName')}
        title={t('editName')}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line/60 bg-bg/40 text-[15px] text-ink backdrop-blur-sm active:scale-95"
      >
        ✎
      </button>
    </div>
  );
}
