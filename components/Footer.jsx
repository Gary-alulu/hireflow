import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const LINK_COLUMNS = [
  {
    title: 'Product',
    links: [
      { label: 'Find Jobs', href: '/jobs' },
      { label: 'For Recruiters', href: '/register?role=recruiter' },
      { label: 'For Candidates', href: '/register?role=candidate' },
      { label: 'Pricing & Plans', href: '/services#pricing' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Services', href: '/services' },
      { label: 'Our Story', href: '/about' },
      { label: 'Legal Center', href: '/legal' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Sign In', href: '/login' },
      { label: 'Create Account', href: '/register' },
      { label: 'Job Board', href: '/jobs' },
    ],
  },
];

const SOCIALS = [
  {
    label: 'LinkedIn',
    href: '#',
    path: (
      <>
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </>
    ),
  },
  {
    label: 'X',
    href: '#',
    path: (
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    ),
  },
  {
    label: 'GitHub',
    href: '#',
    path: (
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    ),
  },
];

export default function Footer() {
  return (
    <footer className="hf-footer">
      <div className="hf-footer-glow" aria-hidden="true" />

      <div className="hf-footer-inner">
        <div className="hf-footer-top">
          <div className="hf-footer-brand">
            <Link href="/" className="hf-footer-logo-link">
              <span className="hf-footer-logo-badge">
                <img src="/images/hireflow-logo.png" alt="" />
              </span>
              <span className="hf-footer-logo-text">HireFlow</span>
            </Link>
            <p className="hf-footer-tagline">
              One intelligent workflow for the entire hiring journey — from
              discovering talent to getting hired.
            </p>
            <Link href="/register" className="hf-footer-cta">
              Get started free <ArrowRight size={15} />
            </Link>
            <div className="hf-footer-socials">
              {SOCIALS.map(({ label, href, path }) => (
                <a key={label} href={href} className="hf-footer-social" aria-label={label}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    {path}
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <nav className="hf-footer-cols" aria-label="Footer navigation">
            {LINK_COLUMNS.map((column) => (
              <div className="hf-footer-col" key={column.title}>
                <h3 className="hf-footer-col-title">{column.title}</h3>
                <ul>
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="hf-footer-link">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="hf-footer-bottom">
          <p className="hf-footer-copy">© 2026 HireFlow. All rights reserved.</p>
          <div className="hf-footer-legal">
            <Link href="/legal/privacy">Privacy</Link>
            <Link href="/legal/terms">Terms</Link>
            <Link href="/legal/cookies">Cookies</Link>
            <Link href="/legal/policies">Policies</Link>
          </div>
          <p className="hf-footer-made">Built for better hiring.</p>
        </div>
      </div>
    </footer>
  );
}
