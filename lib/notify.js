// Notification + email dispatch helpers.
// Email delivery is a no-op stub until a provider (e.g. Resend, SMTP) is configured,
// mirroring how lib/ai.js falls back to mock behaviour without an API key.

import Notification from '@/models/Notification';

/**
 * Best-effort email send. Without EMAIL_FROM/EMAIL_PROVIDER_* configured this only
 * logs the intended email, keeping the rest of the product fully functional.
 * @param {Object} opts { to, subject, text }
 */
export async function sendEmail({ to, subject, text }) {
  if (!to) return;
  if (process.env.EMAIL_PROVIDER === 'resend' && process.env.RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'HireFlow <no-reply@hireflow.dev>',
          to,
          subject,
          text,
        }),
      });
      if (!res.ok) console.warn('Email send failed:', res.status, await res.text().catch(() => ''));
    } catch (error) {
      console.error('Email send error:', error);
    }
    return;
  }
  console.log(`[email:stub] to=${to} subject="${subject}"`);
}

/**
 * Create an in-app notification for a user and attempt the matching email.
 * @param {Object} opts { userId, role, type, title, message, link, email }
 */
export async function createNotification({ userId, role, type, title, message, link, email }) {
  let notification = null;
  try {
    notification = await Notification.create({ userId, role, type, title, message, link });
  } catch (error) {
    console.error('Notification create error:', error);
  }
  if (email) {
    sendEmail({
      to: email,
      subject: title,
      text: message ? `${message}\n\nView in HireFlow: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3100'}${link || '/dashboard'}` : title,
    }).catch(() => {});
  }
  return notification;
}