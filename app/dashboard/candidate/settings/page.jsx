'use client';

import { useState, useEffect } from 'react';
import { Save, User, Mail, ShieldCheck } from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import AccountDangerZone from '@/components/AccountDangerZone';

export default function CandidateSettingsPage() {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/auth/session');
        const data = await res.json();
        setFormData({
          name: data.user?.name || '',
          email: data.user?.email || '',
        });
      } catch (err) {
        console.error('Failed to load account:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name }),
      });
      if (res.ok) {
        setMessage('Profile name saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to save.');
      }
    } catch (err) {
      console.error('Error saving profile name', err);
      setMessage('An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageTransition key="loading">
        <div className="text-center py-10" style={{ color: 'var(--color-text-secondary)' }}>Loading settings...</div>
      </PageTransition>
    );
  }

  return (
    <PageTransition key="ready">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-h2" style={{ color: 'var(--gray-900)' }}>Settings</h1>
          <p className="text-body mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            Manage your account and personal details.
          </p>
        </div>

        {message && (
          <div className={`hf-alert ${message.includes('success') ? 'hf-alert-success' : 'hf-alert-error'}`}>{message}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="hf-card p-6 md:p-8">
            <div className="flex items-center gap-2 mb-6">
              <User className="h-5 w-5" style={{ color: 'var(--brand-600)' }} />
              <h2 className="text-h3" style={{ color: 'var(--gray-900)' }}>Account</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="hf-field">
                <label className="hf-label">Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} className="hf-input" required />
              </div>
              <div className="hf-field">
                <label className="hf-label">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="email" value={formData.email} className="hf-input pl-10" disabled />
                </div>
                <p className="hf-helper-text">Email cannot be changed.</p>
              </div>
            </div>
          </div>

          <div className="hf-card p-6 md:p-8">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="h-5 w-5" style={{ color: 'var(--brand-600)' }} />
              <h2 className="text-h3" style={{ color: 'var(--gray-900)' }}>Privacy</h2>
            </div>
            <p className="text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Your resume and profile are only shared with recruiters when you apply to a job.
              Your application is never public, and recruiter notes and tags are never shown to you or other candidates.
            </p>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="hf-btn hf-btn-primary hf-btn-lg px-8">
              {saving ? 'Saving...' : <><Save className="h-4 w-4 mr-2" /> Save Changes</>}
            </button>
          </div>
        </form>

        <div className="pt-2">
          <AccountDangerZone />
        </div>
      </div>
    </PageTransition>
  );
}