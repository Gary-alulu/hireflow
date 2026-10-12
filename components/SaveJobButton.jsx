'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react';

export default function SaveJobButton({ jobId }) {
  const router = useRouter();
  const [saved, setSaved] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function checkSaved() {
      try {
        const res = await fetch(`/api/saved-jobs?jobId=${jobId}`);
        if (res.status === 401) {
          if (!cancelled) setSaved(false);
          return;
        }
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) setSaved(data.saved);
        }
      } catch {
        if (!cancelled) setSaved(false);
      }
    }
    checkSaved();
    return () => { cancelled = true; };
  }, [jobId]);

  const toggle = async () => {
    if (saved === null || busy) return;
    setBusy(true);
    try {
      if (saved) {
        const res = await fetch(`/api/saved-jobs?jobId=${jobId}`, { method: 'DELETE' });
        if (res.ok) setSaved(false);
      } else {
        const res = await fetch('/api/saved-jobs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobId }),
        });
        if (res.status === 401) {
          router.push('/login');
          return;
        }
        if (res.ok) setSaved(true);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={saved === null || busy}
      className={`hf-btn w-full ${saved ? 'hf-btn-primary' : 'hf-btn-secondary'}`}
    >
      {busy || saved === null ? (
        <Loader2 size={16} className="animate-spin" />
      ) : saved ? (
        <BookmarkCheck size={16} />
      ) : (
        <Bookmark size={16} />
      )}
      {saved ? 'Saved' : 'Save Job'}
    </button>
  );
}