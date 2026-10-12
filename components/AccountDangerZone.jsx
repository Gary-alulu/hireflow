'use client';

import { useState } from 'react';
import { AlertCircle, Loader2, Trash2 } from 'lucide-react';

// Right-to-be-forgotten: fully delete the account and every piece of recruitment
// data tied to it (profile, resumes, applications, jobs, interviews, messages).
export default function AccountDangerZone() {
  const [step, setStep] = useState('idle');
  const [email, setEmail] = useState('');
  const [sessionEmail, setSessionEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const begin = async () => {
    setError('');
    try {
      const res = await fetch('/api/auth/session');
      const data = await res.json();
      setSessionEmail(data.user?.email || '');
    } catch {
      setSessionEmail('');
    }
    setEmail('');
    setStep('confirm');
  };

  const confirmDelete = async () => {
    if (!sessionEmail || email.trim().toLowerCase() !== sessionEmail.toLowerCase()) {
      setError('The email you typed does not match your account email.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/auth/account', { method: 'DELETE' });
      if (!res.ok) {
        const { error: e } = await res.json().catch(() => ({}));
        setError(e || 'Could not delete your account. Please try again.');
        setBusy(false);
        return;
      }
      await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
      window.location.href = '/login';
    } catch {
      setError('Could not delete your account. Please try again.');
      setBusy(false);
    }
  };

  if (step === 'idle') {
    return (
      <div className="rounded-xl border border-red-200 p-5" style={{ backgroundColor: 'var(--color-card)' }}>
        <h3 className="text-body font-semibold flex items-center gap-2" style={{ color: 'var(--red-700)' }}>
          <AlertCircle size={16} /> Danger zone
        </h3>
        <p className="text-body-sm mt-2" style={{ color: 'var(--color-text-secondary)' }}>
          Deleting your account permanently removes your profile, resumes, applications, interviews, messages and notifications.
          This cannot be undone.
        </p>
        <button onClick={begin} className="mt-4 hf-btn hf-btn-sm" style={{ backgroundColor: 'var(--red-600)', color: '#fff', borderColor: 'var(--red-600)' }}>
          <Trash2 size={14} /> Delete account
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-red-200 p-5" style={{ backgroundColor: 'var(--color-card)' }}>
      <h3 className="text-body font-semibold flex items-center gap-2" style={{ color: 'var(--red-700)' }}>
        <AlertCircle size={16} /> Confirm account deletion
      </h3>
      <p className="text-body-sm mt-2" style={{ color: 'var(--color-text-secondary)' }}>
        Type <span className="font-semibold" style={{ color: 'var(--gray-800)' }}>{sessionEmail || 'your account email'}</span> to confirm. This permanently deletes your account and all associated data.
      </p>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={sessionEmail || 'you@example.com'}
        className="hf-input mt-3"
        autoComplete="off"
      />
      {error && (
        <p className="text-body-sm mt-2" style={{ color: 'var(--red-600)' }}>{error}</p>
      )}
      <div className="flex items-center gap-2 mt-4">
        <button
          onClick={confirmDelete}
          disabled={busy}
          className="hf-btn hf-btn-sm"
          style={{ backgroundColor: 'var(--red-600)', color: '#fff', borderColor: 'var(--red-600)' }}
        >
          {busy && <Loader2 size={14} className="animate-spin" />}
          {busy ? 'Deleting…' : 'Permanently delete my account'}
        </button>
        <button onClick={() => setStep('idle')} disabled={busy} className="hf-btn hf-btn-ghost hf-btn-sm">Cancel</button>
      </div>
    </div>
  );
}