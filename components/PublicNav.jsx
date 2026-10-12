import Link from 'next/link';

const NAV_LINKS = [
  { label: 'Find a Job', href: '/jobs' },
  { label: 'About Us', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Contact', href: '/contact' },
  { label: 'Legal', href: '/legal' },
];

export default function PublicNav() {
  return (
    <nav className="max-w-[1400px] mx-auto px-6 py-6 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-3">
        <img src="/images/hireflow-logo.png" alt="HireFlow" className="h-9 w-9 rounded-xl object-contain" />
        <span className="text-xl font-bold" style={{ color: 'var(--brand-900)' }}>HireFlow</span>
      </Link>
      <div className="hidden md:flex items-center gap-8">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-sm font-medium transition-colors"
            style={{ color: 'var(--gray-600)' }}
          >
            {link.label}
          </Link>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <Link href="/login" className="hidden sm:inline-flex hf-btn hf-btn-ghost text-sm">
          Sign In
        </Link>
        <Link href="/register" className="hf-btn hf-btn-primary text-sm">
          Get Started
        </Link>
      </div>
    </nav>
  );
}
