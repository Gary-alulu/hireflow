'use client';

import { useState, useRef } from 'react';
import { X, Plus, Tag } from 'lucide-react';
import { RECRUITER_TAG_PRESETS } from '@/lib/tags';
import useDismiss from '@/components/ui/useDismiss';

// Reusable recruiter tag editor: existing tags as removable chips, a free-text
// box (Enter to add), and a shortcut menu of common recrting tags.
export default function TagEditor({ value = [], onChange, suggestions = RECRUITER_TAG_PRESETS }) {
  const [draft, setDraft] = useState('');
  const [showPresets, setShowPresets] = useState(false);
  const presetsRef = useRef(null);

  useDismiss(presetsRef, showPresets, () => setShowPresets(false));

  const add = (raw) => {
    const tag = String(raw || '').trim().slice(0, 30);
    if (!tag) return;
    if (value.some((v) => v.toLowerCase() === tag.toLowerCase())) return;
    onChange([...value, tag]);
  };

  const remove = (tag) => onChange(value.filter((v) => v !== tag));

  const availablePresets = suggestions.filter(
    (s) => !value.some((v) => v.toLowerCase() === s.toLowerCase())
  );

  return (
    <div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {value.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
              style={{ backgroundColor: 'var(--brand-50)', color: 'var(--brand-700)', border: '1px solid var(--brand-200)' }}
            >
              {tag}
              <button
                type="button"
                onClick={() => remove(tag)}
                className="hover:text-red-600 transition-colors"
                aria-label={`Remove ${tag}`}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex items-center gap-1.5">
        <form onSubmit={(e) => { e.preventDefault(); add(draft); setDraft(''); }} className="flex-1 relative">
          <Tag size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--gray-400)' }} />
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={value.length ? 'Add another tag, Enter to save' : 'Add a tag, Enter to save'}
            className="hf-input !h-8 !text-xs pl-8"
          />
        </form>
        {availablePresets.length > 0 && (
          <div className="relative" ref={presetsRef}>
            <button
              type="button"
              onClick={() => setShowPresets((s) => !s)}
              aria-haspopup="true"
              aria-expanded={showPresets}
              className="hf-btn hf-btn-ghost hf-btn-sm !h-8"
            >
              <Plus size={13} /> Presets
            </button>
            {showPresets && (
              <div className="hf-dropdown-panel absolute right-0 top-9 z-30 p-2 w-52 grid grid-cols-2 gap-1">
                {availablePresets.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => { add(p); setShowPresets(false); }}
                    className="text-left text-xs px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}