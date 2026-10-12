'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Briefcase, FileText, Calendar, User, Bookmark, Settings
} from 'lucide-react';
import LogoutButton from '@/components/LogoutButton';
import { cn } from '@/lib/utils';

export const candidateNavItems = [
  { href: '/dashboard/candidate',               label: 'Overview',     icon: LayoutDashboard },
  { href: '/jobs',                               label: 'Browse Jobs',  icon: Briefcase },
  { href: '/dashboard/candidate/applications',  label: 'Applications', icon: FileText },
  { href: '/dashboard/candidate/saved',         label: 'Saved Jobs',   icon: Bookmark },
  { href: '/dashboard/candidate/interviews',    label: 'Interviews',   icon: Calendar },
  { href: '/dashboard/candidate/profile',       label: 'My Profile',   icon: User },
  { href: '/dashboard/candidate/settings',      label: 'Settings',     icon: Settings },
];

export default function CandidateSidebar({ onNavigate = null }) {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: 'var(--sidebar-width)',
        background: 'var(--color-sidebar-bg)',
        viewTransitionName: 'site-sidebar',
      }}
      className="hidden md:flex flex-col h-screen sticky top-0 flex-shrink-0"
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-white/10">
        <img src="/images/hireflow-logo.png" alt="HireFlow" className="h-8 w-8 rounded-lg bg-white object-contain flex-shrink-0" />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {candidateNavItems.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/dashboard/candidate'
            ? pathname === href
            : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              transitionTypes={['nav-forward']}
              className={cn('hf-nav-link', isActive && 'active')}
            >
              <Icon size={16} className="flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-4 pt-2 border-t border-white/10">
        <LogoutButton />
      </div>
    </aside>
  );
}
