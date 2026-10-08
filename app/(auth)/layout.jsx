import Link from 'next/link';

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-md w-full hf-stagger">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                <path d="M3 4h10M3 8h7M3 12h5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
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
