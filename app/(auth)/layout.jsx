import Link from 'next/link';

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-md w-full hf-stagger">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/images/hireflow-logo.png" alt="HireFlow" className="h-8 w-8 rounded-full bg-white object-contain flex-shrink-0" />
            <span className="font-bold text-xl tracking-tight" style={{ color: 'var(--gray-900)' }}>HireFlow</span>
          </Link>
        </div>
        
        {/* Auth Card */}
        <div className="hf-card p-8 shadow-md">
          {children}
        </div>
      </div>
    </div>
  );
}
