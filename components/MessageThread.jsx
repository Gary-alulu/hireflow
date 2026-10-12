'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, MessageSquareText } from 'lucide-react';

export default function MessageThread({ applicationId, currentUserId }) {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  const fetchMessages = useCallback(async () => {
    if (!applicationId) return;
    try {
      const res = await fetch(`/api/messages?applicationId=${encodeURIComponent(applicationId)}`);
      if (!res.ok) {
        const { error: err } = await res.json().catch(() => ({}));
        setError(err || 'Could not load messages');
        return;
      }
      const data = await res.json();
      setMessages(data.messages || []);
      setError('');
    } catch (err) {
      console.error('Failed to fetch messages', err);
      setError('Could not load messages');
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    setLoading(true);
    setMessages([]);
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length]);

  const send = async (e) => {
    e.preventDefault();
    const body = draft.trim();
    if (!body || !applicationId) return;
    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId, body }),
      });
      if (!res.ok) {
        const { error: err } = await res.json().catch(() => ({}));
        setError(err || 'Could not send message');
        return;
      }
      setDraft('');
      await fetchMessages();
    } catch (err) {
      console.error('Failed to send message', err);
      setError('Could not send message');
    } finally {
      setSending(false);
    }
  };

  const senderName = (m) => (m.senderId?.name ? m.senderId.name : 'You');
  const isMine = (m) => currentUserId && String(m.senderId?._id || m.senderId) === String(currentUserId);

  return (
    <div className="flex flex-col h-full min-h-[280px]">
      <div className="flex items-center gap-2 pb-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <MessageSquareText size={16} style={{ color: 'var(--brand-600)' }} />
        <span className="text-body-sm font-semibold" style={{ color: 'var(--gray-900)' }}>Messages with candidate</span>
      </div>

      <div className="flex-1 overflow-y-auto py-3 space-y-3 max-h-[360px] min-h-[200px]">
        {loading ? (
          <p className="text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>
            No messages yet — start the conversation about this application.
          </p>
        ) : (
          messages.map((m) => (
            <div key={m._id} className={`flex ${isMine(m) ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] px-3 py-2 rounded-2xl text-body-sm ${isMine(m) ? 'rounded-br-sm' : 'rounded-bl-sm'}`}
                style={
                  isMine(m)
                    ? { backgroundColor: 'var(--brand-600)', color: '#fff' }
                    : { backgroundColor: 'var(--gray-100)', color: 'var(--gray-800)' }
                }
              >
                {!isMine(m) && (
                  <p className="text-body-xs font-medium mb-0.5" style={{ opacity: 0.75 }}>{senderName(m)}</p>
                )}
                <p className="whitespace-pre-wrap break-words">{m.body}</p>
                <p className={`text-body-xs mt-1 ${isMine(m) ? 'text-white/70' : ''}`} style={{ opacity: 0.65 }}>
                  {new Date(m.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {error && (
        <p className="text-body-sm text-red-600 mb-2" style={{ color: 'var(--error-600)' }}>{error}</p>
      )}

      <form onSubmit={send} className="pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Write a message..."
            className="hf-input flex-1"
          />
          <button
            type="submit"
            disabled={sending || !draft.trim()}
            className="hf-btn hf-btn-primary"
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}