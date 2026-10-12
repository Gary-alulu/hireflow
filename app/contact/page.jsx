import Link from 'next/link';
import { Mail, Clock, Building2, ArrowRight, MessageCircle, Globe } from 'lucide-react';
import PublicNav from '@/components/PublicNav';
import Footer from '@/components/Footer';
import ContactForm from '@/components/ContactForm';
import { CONTACT_EMAIL, SUPPORT_EMAIL, SALES_EMAIL } from '@/lib/contact';

export const metadata = {
  title: 'Contact Us | HireFlow',
  description: "Get in touch with the HireFlow team — support for candidates, recruiters, and partners.",
};

const CHANNELS = [
  { icon: MessageCircle, label: 'Support', value: SUPPORT_EMAIL, href: `mailto:${SUPPORT_EMAIL}`, note: 'Help with your account or the platform.' },
  { icon: Building2, label: 'Sales', value: SALES_EMAIL, href: `mailto:${SALES_EMAIL}`, note: 'Plans, pricing, and team onboarding.' },
  { icon: Globe, label: 'General', value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}`, note: 'Partnerships, press, and everything else.' },
];

const HELPFUL = [
  { label: 'Browse open roles', href: '/jobs' },
  { label: 'Legal Center', href: '/legal' },
  { label: 'Create a recruiter account', href: '/register?role=recruiter' },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--gray-50)' }}>
      <PublicNav />

      <main className="flex-1">
        <header className="contact-hero">
          <div className="contact-hero-inner">
            <span className="contact-hero-badge">
              <Mail size={16} /> Contact
            </span>
            <h1 className="contact-hero-title">Let&rsquo;s talk</h1>
            <p className="contact-hero-lede">
              Questions about hiring, job seeking, or working with HireFlow? Send us a message and a
              real human will get back to you.
            </p>
          </div>
        </header>

        <div className="contact-layout">
          <div className="contact-card">
            <ContactForm />
          </div>

          <aside className="contact-aside">
            <div className="contact-block">
              <h2 className="contact-block-title">Reach us directly</h2>
              <ul className="contact-channels">
                {CHANNELS.map(({ icon: Icon, label, value, href, note }) => (
                  <li key={label} className="contact-channel">
                    <span className="contact-channel-icon">
                      <Icon size={17} />
                    </span>
                    <div>
                      <p className="contact-channel-label">{label}</p>
                      <a href={href} className="contact-channel-value">{value}</a>
                      <p className="contact-channel-note">{note}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="contact-block">
              <h2 className="contact-block-title">
                <Clock size={15} /> Support hours
              </h2>
              <p className="contact-block-text">
                Monday to Friday, 9:00–18:00 (GMT). Outside these hours, leave a message and we&rsquo;ll
                reply on the next business day.
              </p>
            </div>

            <div className="contact-block">
              <h2 className="contact-block-title">Quick links</h2>
              <ul className="contact-links">
                {HELPFUL.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="contact-link">
                      {link.label} <ArrowRight size={14} />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
