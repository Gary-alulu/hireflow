'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Loader2, Send } from 'lucide-react';
import Select from '@/components/ui/Select';
import { CONTACT_TOPICS } from '@/lib/contact';

const EMPTY = { name: '', email: '', company: '', topic: '', subject: '', message: '' };

export default function ContactForm() {
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const update = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.name.trim() || !form.email.trim() || !form.topic || !form.message.trim()) {
      setError('Please fill in your name, email, topic, and message.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Failed to send your message. Please try again.');
        return;
      }
      setSent(true);
    } catch {
      setError('Failed to send your message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="contact-success">
        <div className="contact-success-icon">
          <CheckCircle2 size={30} />
        </div>
        <h2>Message sent</h2>
        <p>
          Thanks, {form.name.split(' ')[0] || 'there'} — your message is on its way. Our team
          typically replies within one business day.
        </p>
        <div className="contact-success-actions">
          <button type="button" className="hf-btn hf-btn-secondary" onClick={() => { setForm(EMPTY); setSent(false); }}>
            Send another message
          </button>
          <Link href="/jobs" className="hf-btn hf-btn-primary">
            Browse jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="contact-form" noValidate>
      {error ? <div className="hf-alert hf-alert-error">{error}</div> : null}

      <div className="contact-form-row">
        <div className="hf-field">
          <label className="hf-label" htmlFor="contact-name">
            Full name <span className="contact-req">*</span>
          </label>
          <input
            id="contact-name"
            className="hf-input"
            value={form.name}
            onChange={update('name')}
            placeholder="Jane Doe"
            autoComplete="name"
            maxLength={120}
          />
        </div>
        <div className="hf-field">
          <label className="hf-label" htmlFor="contact-email">
            Email <span className="contact-req">*</span>
          </label>
          <input
            id="contact-email"
            type="email"
            className="hf-input"
            value={form.email}
            onChange={update('email')}
            placeholder="jane@company.com"
            autoComplete="email"
            maxLength={200}
          />
        </div>
      </div>

      <div className="contact-form-row">
        <div className="hf-field">
          <label className="hf-label" htmlFor="contact-company">
            Company <span className="contact-optional">(optional)</span>
          </label>
          <input
            id="contact-company"
            className="hf-input"
            value={form.company}
            onChange={update('company')}
            placeholder="Acme Inc."
            autoComplete="organization"
            maxLength={160}
          />
        </div>
        <div className="hf-field">
          <label className="hf-label" id="contact-topic-label">
            What can we help with? <span className="contact-req">*</span>
          </label>
          <Select
            value={form.topic}
            onChange={(value) => {
              setForm((prev) => ({ ...prev, topic: value }));
              setError('');
            }}
            options={CONTACT_TOPICS}
            placeholder="Choose a topic"
            ariaLabel="What can we help with?"
            id="contact-topic"
          />
        </div>
      </div>

      <div className="hf-field">
        <label className="hf-label" htmlFor="contact-subject">
          Subject <span className="contact-optional">(optional)</span>
        </label>
        <input
          id="contact-subject"
          className="hf-input"
          value={form.subject}
          onChange={update('subject')}
          placeholder="How can we help?"
          maxLength={200}
        />
      </div>

      <div className="hf-field">
        <label className="hf-label" htmlFor="contact-message">
          Message <span className="contact-req">*</span>
        </label>
        <textarea
          id="contact-message"
          className="hf-textarea"
          rows={6}
          value={form.message}
          onChange={update('message')}
          placeholder="Tell us a little about what you need…"
          maxLength={5000}
        />
      </div>

      <div className="contact-form-footer">
        <p className="contact-form-note">
          By sending this you agree to our{' '}
          <Link href="/legal/privacy">Privacy Policy</Link>.
        </p>
        <button type="submit" className="hf-btn hf-btn-primary" disabled={submitting}>
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          {submitting ? 'Sending…' : 'Send message'}
        </button>
      </div>
    </form>
  );
}
