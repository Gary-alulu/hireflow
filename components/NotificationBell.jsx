'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, CheckCheck, Inbox } from 'lucide-react';
import useDismiss from '@/components/ui/useDismiss';

const LINK_PREFIXES = { recruiter: '/dashboard/recruiter', candidate: '/dashboard/candidate' };

export default function NotificationBell({ role = 'candidate' }) {
  const [openDropdown, setOpenDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const dropdownRef = useRef(null);
  const firstRunRef = useRef(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications?limit=15');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnread(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  }, []);

  // Poll every 45s while mounted, and immediately on the first run.
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 45000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close the dropdown when clicking elsewhere or pressing Escape.
  useDismiss(dropdownRef, openDropdown, () => setOpenDropdown(false));

  const toggleDropdown = async () => {
    const next = !openDropdown;
    setOpenDropdown(next);
    // Refresh on open; also drop the pulsing state on the first open.
    if (next) {
      fetchNotifications();
      if (firstRunRef.current) firstRunRef.current = false;
    }
  };

  const markAllRead = async () => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      });
      if (res.ok) setUnread(0);
    } catch (error) {
      console.error('Failed to mark notifications read', error);
    }
  };

  const markOneRead = async (id) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: 'PUT' });
      setUnread((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification read', error);
    }
  };

  const notifHref = (n) => n.link || `${LINK_PREFIXES[role]}`;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        aria-label="Notifications"
        aria-haspopup="true"
        aria-expanded={openDropdown}
        className="pfp hf-btn hf-btn-ghost hf-btn-sm relative"
        style={{ flexShrink: 0 }}
      >
        <Bell size={19} />
        {unread > 0 && !openDropdown && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] leading-[18px] text-center font-semibold bg-red-500 text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {openDropdown && (
        <div className="hf-dropdown-panel absolute right-0 mt-2 w-[340px] max-w-[90vw] z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <span className="text-body-sm font-semibold" style={{ color: 'var(--gray-900)' }}>Notifications</span>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-body-sm flex items-center gap-1" style={{ color: 'var(--brand-600)' }}>
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>
          <div className="max-h-[360px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-10 text-center text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>
                <Inbox className="mx-auto h-8 w-8 mb-2 opacity-40" />
                No notifications yet
              </div>
            ) : (
              notifications.map((n) => (
                <a
                  key={n._id}
                  href={notifHref(n)}
                  onClick={() => !n.read && markOneRead(n._id)}
                  className="block px-4 py-3 border-b last:border-b-0 hover:bg-gray-50"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${n.read ? '' : ''}`}
                      style={{ backgroundColor: n.read ? 'var(--gray-300)' : 'var(--brand-500)' }}
                    />
                    <div className="min-w-0">
                      <p className="text-body-sm font-medium truncate" style={{ color: 'var(--gray-900)' }}>{n.title}</p>
                      {n.message && (
                        <p className="text-body-xs text-gray-500 line-clamp-2 mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>{n.message}</p>
                      )}
                      <p className="text-body-xs mt-1" style={{ color: 'var(--gray-400)' }}>
                        {new Date(n.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </p>
                    </div>
                  </div>
                </a>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}