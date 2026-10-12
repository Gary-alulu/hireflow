import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import ContactMessage from '@/models/ContactMessage';
import { CONTACT_TOPICS } from '@/lib/contact';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));

    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const company = String(body.company || '').trim();
    const topic = String(body.topic || '').trim();
    const subject = String(body.subject || '').trim();
    const message = String(body.message || '').trim();

    if (!name || !email || !topic || !message) {
      return NextResponse.json(
        { error: 'Please fill in your name, email, topic, and message.' },
        { status: 400 }
      );
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }
    if (!CONTACT_TOPICS.includes(topic)) {
      return NextResponse.json({ error: 'Please choose a valid topic.' }, { status: 400 });
    }
    if (message.length < 10) {
      return NextResponse.json(
        { error: 'Please include a little more detail in your message.' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const created = await ContactMessage.create({
      name: name.slice(0, 120),
      email: email.slice(0, 200),
      company: company.slice(0, 160),
      topic,
      subject: subject.slice(0, 200),
      message: message.slice(0, 5000),
    });

    return NextResponse.json(
      { message: "Thanks for reaching out — we'll be in touch shortly.", id: created._id },
      { status: 201 }
    );
  } catch (err) {
    console.error('Contact message error:', err);
    return NextResponse.json(
      { error: 'Something went wrong sending your message. Please try again.' },
      { status: 500 }
    );
  }
}
