'use client';

import { LogOut } from 'lucide-react';

export default function LogoutButton() {
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  return (
    <button
      onClick={handleLogout}
      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/6 transition-colors duration-150"
    >
      <LogOut size={16} className="flex-shrink-0" />
      Sign out
    </button>
  );
}
