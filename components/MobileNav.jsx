'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { candidateNavItems } from '@/components/CandidateSidebar';
import { recruiterNavItems } from '@/components/RecruiterSidebar';
import { cn } from '@/lib/utils';
import LogoutButton from '@/components/LogoutButton';

// Mobile-only navigation drawer. Desktop keeps the fixed sidebars (md:flex).
export default function MobileNav({ role }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const items = role === 'recruiter' ? recruiterNavItems : candidateNavItems;

  return (
    <div className="md:hidden border-b" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-sidebar-bg)' }}>
      <div className="flex items-center justify-between px-4 h-14">
        <img src="/images/hireflow-logo.png" alt="HireFlow" className="h-7 w-7 rounded-lg bg-white object-contain flex-shrink-0" />
        <div className="flex items-center gap-1">
          <span className="text-sm font-semibold mr-1" style={{ color: '#fff' }}>{role === 'recruiter' ? 'Recruiter' : 'Candidate'}</span>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? 'Close navigation' : 'Open navigation'}
            aria-expanded={open}
            className="p-2 rounded-lg hover:bg-white/10"
            style={{ color: '#fff' }}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="hf-mobile-nav px-3 pb-4 space-y-0.5">
          {items.map(({ href, label, icon: Icon }) => {
            const isActive = href === pathname.split('/').slice(0, 3).join('/') ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn('hf-nav-link', isActive && 'active')}
              >
                <Icon size={16} className="flex-shrink-0" />
                {label}
              </Link>
            );
          })}
          <div className="pt-2 mt-2 border-t border-white/10">
            <LogoutButton />
          </div>
        </nav>
      )}
    </div>
  );
}