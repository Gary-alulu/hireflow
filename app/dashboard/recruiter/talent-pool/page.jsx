'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search, MapPin, Briefcase, User, Bookmark, BookmarkCheck, Loader2,
  Trash2, StickyNote, Check, X, UsersRound,
} from 'lucide-react';
import { getCvDownloadUrl, timeAgo } from '@/lib/utils';
import PageTransition from '@/components/PageTransition';
import TagEditor from '@/components/TagEditor';

const initials = (name) =>
  String(name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || '?';

export default function TalentPoolPage() {
  const [q, setQ] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [saved, setSaved] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');
  const [editingNote, setEditingNote] = useState(null);
  const [noteDrafts, setNoteDrafts] = useState({});
  const [editingTags, setEditingTags] = useState(null);
  const [tagDrafts, setTagDrafts] = useState({});

  const savedKey = (item) => String(item.candidate?._id || item.candidateId);

  const loadSaved = useCallback(async () => {
    setLoadingSaved(true);
    try {
      const res = await fetch('/api/talent-pool');
      if (!res.ok) {
        const { error: e } = await res.json().catch(() => ({}));
        setError(e || 'Could not load your talent pool');
        return;
      }
      const data = await res.json();
      setSaved(data.saved || []);
    } catch (err) {
      console.error('Failed to load talent pool', err);
      setError('Could not load your talent pool');
    } finally {
      setLoadingSaved(false);
    }
  }, []);

  useEffect(() => {
    loadSaved();
  }, [loadSaved]);

  const runSearch = async (e) => {
    e?.preventDefault();
    setSearching(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set('search', q.trim());
      const res = await fetch(`/api/candidates?search=${encodeURIComponent(q.trim())}`);
      if (!res.ok) {
        const { error: err } = await res.json().catch(() => ({}));
        setError(err || 'Search failed');
        return;
      }
      const data = await res.json();
      setResults(data.candidates || []);
      setSearched(true);
    } catch (err) {
      console.error('Search failed', err);
      setError('Search failed');
    } finally {
      setSearching(false);
    }
  };

  const isSaved = (candidateId) => saved.some((s) => savedKey(s) === String(candidateId));

  const toggleSave = async (candidateId) => {
    const id = String(candidateId);
    const exists = isSaved(id);
    setBusyId(`${id}:${Date.now()}`);
    try {
      const res = await fetch(`/api/talent-pool${exists ? `?candidateId=${id}` : ''}`, {
        method: exists ? 'DELETE' : 'POST',
        headers: exists ? {} : { 'Content-Type': 'application/json' },
        body: exists ? undefined : JSON.stringify({ candidateId: id }),
      });
      if (res.ok || res.status === 404) {
        await loadSaved();
      } else {
        const { error: err } = await res.json().catch(() => ({}));
        setError(err || 'Could not update talent pool');
      }
    } catch (err) {
      console.error('Failed to update talent pool', err);
      setError('Could not update talent pool');
    } finally {
      setBusyId(null);
    }
  };

  const removeSaved = async (item) => {
    setBusyId(`rm:${savedKey(item)}`);
    try {
      await fetch(`/api/talent-pool?candidateId=${savedKey(item)}`, { method: 'DELETE' });
      await loadSaved();
    } catch (err) {
      console.error('Remove failed', err);
    } finally {
      setBusyId(null);
    }
  };

  const saveNote = async (item) => {
    const text = (noteDrafts[savedKey(item)] ?? item.note ?? '').trim();
    setBusyId(`note:${savedKey(item)}`);
    try {
      const res = await fetch('/api/talent-pool', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ savedId: item._id, note: text }),
      });
      if (res.ok) {
        setEditingNote(null);
        await loadSaved();
      } else {
        const { error: err } = await res.json().catch(() => ({}));
        setError(err || 'Could not save note');
      }
    } catch (err) {
      console.error('Note save failed', err);
      setError('Could not save note');
    } finally {
      setBusyId(null);
    }
  };

  const saveTags = async (item) => {
    const tags = tagDrafts[savedKey(item)] ?? item.tags ?? [];
    setBusyId(`tags:${savedKey(item)}`);
    try {
      const res = await fetch('/api/talent-pool', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ savedId: item._id, tags }),
      });
      if (res.ok) {
        setEditingTags(null);
        setTagDrafts((d) => ({ ...d, [savedKey(item)]: tags }));
        await loadSaved();
      } else {
        const { error: err } = await res.json().catch(() => ({}));
        setError(err || 'Could not save tags');
      }
    } catch (err) {
      console.error('Tag save failed', err);
      setError('Could not save tags');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-h2" style={{ color: 'var(--gray-900)' }}>Talent Pool</h1>
          <p className="text-body mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            Save promising candidates even when you aren&apos;t hiring them yet, tag and annotate them, and pick up the conversation later.
          </p>
        </div>

        {error && (
          <div className="hf-alert hf-alert-error items-center">
            <X size={18} className="flex-shrink-0" />
            <span>{error}</span>
            <button onClick={() => setError('')} className="ml-auto hf-btn hf-btn-ghost hf-btn-sm">Dismiss</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Find candidates */}
          <div className="space-y-4">
            <div className="hf-card p-5">
              <h2 className="text-h4 mb-3" style={{ color: 'var(--gray-900)' }}>
                <Search size={16} className="inline mr-1.5" style={{ color: 'var(--gray-400)' }} />
                Find candidates
              </h2>
              <form onSubmit={runSearch} className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
                  <input
                    type="text"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search name, skill, role…"
                    className="hf-input pl-9"
                  />
                </div>
                <button type="submit" disabled={searching} className="hf-btn hf-btn-primary">
                  {searching && <Loader2 size={15} className="animate-spin mr-1.5" />}
                  Search
                </button>
              </form>

              <div className="mt-4 space-y-3 max-h-[26rem] overflow-y-auto pr-1">
                {results.length === 0 && searched && (
                  <p className="text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>No candidates matched. Try another search.</p>
                )}
                {results.map((c) => {
                  const checked = isSaved(c.userId?._id || c.candidateId);
                  const sid = String(c.userId?._id || c.candidateId);
                  return (
                    <div key={sid} className="rounded-xl border p-3.5 flex items-start gap-3" style={{ borderColor: 'var(--color-border)' }}>
                      <div className="h-10 w-10 rounded-full flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: 'var(--brand-100)', color: 'var(--brand-700)' }}>
                        <span className="font-semibold text-xs">{initials(c.userId?.name || c.name)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-body font-semibold truncate" style={{ color: 'var(--gray-900)' }}>{c.userId?.name || c.name}</p>
                        <p className="text-body-sm truncate mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                          <Briefcase size={12} className="inline mr-1" />
                          {(c.experience || []).map((e) => e.title).filter(Boolean)[0] || c.headline || 'Candidate'}
                          {c.location && <> · {c.location}</>}
                        </p>
                        {(c.skills || []).length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {(c.skills).slice(0, 4).map((s, i) => (
                              <span key={i} className="px-1.5 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: 'var(--gray-100)', color: 'var(--gray-700)' }}>{s}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleSave(sid)}
                        disabled={busyId === sid}
                        className="flex-shrink-0 p-2 rounded-lg transition-colors"
                        style={{
                          backgroundColor: checked ? 'var(--brand-50)' : 'var(--gray-100)',
                          color: checked ? 'var(--brand-700)' : 'var(--gray-500)',
                        }}
                        title={checked ? 'Saved' : 'Save to talent pool'}
                      >
                        {checked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Saved candidates */}
          <div>
            <h2 className="text-h4 mb-3 flex items-center gap-2" style={{ color: 'var(--gray-900)' }}>
              <UsersRound size={16} style={{ color: 'var(--gray-400)' }} />
              Saved ({saved.length})
            </h2>
            <div className="space-y-4">
              {loadingSaved && [1, 2].map((i) => <div key={i} className="hf-card h-40 hf-skeleton"></div>)}
              {!loadingSaved && saved.length === 0 && (
                <div className="hf-card p-6 text-center">
                  <Bookmark size={28} className="mx-auto" style={{ color: 'var(--gray-300)' }} />
                  <p className="text-body mt-3" style={{ color: 'var(--color-text-secondary)' }}>
                    No saved candidates yet. Search profiles above and tap the bookmark to save.
                  </p>
                </div>
              )}
              {saved.map((item) => {
                const key = savedKey(item);
                const cand = item.candidate || {};
                const prof = item.profile || {};
                return (
                  <div key={item._id} className="hf-card p-5">
                    <div className="flex items-start gap-3">
                      <div className="h-11 w-11 rounded-full flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: 'var(--brand-100)', color: 'var(--brand-700)' }}>
                        <span className="font-semibold text-sm">{initials(cand.name)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-body font-semibold truncate" style={{ color: 'var(--gray-900)' }}>{cand.name}</p>
                        <p className="text-body-sm truncate" style={{ color: 'var(--color-text-secondary)' }}>
                          {prof.headline || (prof.experience || []).map((e) => e.title).filter(Boolean)[0] || 'Candidate'}
                        </p>
                        <p className="text-body-sm mt-0.5 flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
                          <MapPin size={12} /> {prof.location || 'Location not set'}
                          <span>· Saved {item.savedAt ? timeAgo(item.savedAt) : ''}</span>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSaved(item)}
                        disabled={busyId === `rm:${key}`}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 flex-shrink-0"
                        title="Remove from talent pool"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {(prof.skills || []).length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {prof.skills.slice(0, 6).map((s, i) => (
                          <span key={i} className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: 'var(--gray-100)', color: 'var(--gray-700)' }}>{s}</span>
                        ))}
                      </div>
                    )}

                    {prof.cvUrl && (
                      <a
                        href={getCvDownloadUrl(prof.cvUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-body-sm mt-3 text-blue-600 hover:text-blue-700 font-medium"
                      >
                        <FileGlyph /> View CV
                      </a>
                    )}

                    {/* tags */}
                    <div className="mt-4">
                      {editingTags === key ? (
                        <div className="rounded-lg border border-gray-200 p-3 bg-gray-50">
                          <TagEditor value={tagDrafts[key] ?? item.tags ?? []} onChange={(tags) => setTagDrafts((d) => ({ ...d, [key]: tags }))} />
                          <div className="flex items-center gap-2 mt-2">
                            <button onClick={() => saveTags(item)} disabled={busyId === `tags:${key}`} className="hf-btn hf-btn-primary hf-btn-sm">
                              <Check size={14} /> Save tags
                            </button>
                            <button onClick={() => { setEditingTags(null); setTagDrafts((d) => ({ ...d, [key]: undefined })); }} className="hf-btn hf-btn-ghost hf-btn-sm">Cancel</button>
                          </div>
                        </div>
                      ) : (item.tags || []).length > 0 ? (
                        <button onClick={() => { setEditingTags(key); setTagDrafts((d) => ({ ...d, [key]: item.tags ?? [] })); }} className="flex flex-wrap items-center gap-1.5 text-left">
                          {item.tags.map((t) => (
                            <span key={t} className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: 'var(--brand-50)', color: 'var(--brand-700)', border: '1px solid var(--brand-200)' }}>
                              {t}
                            </span>
                          ))}
                        </button>
                      ) : (
                        <button onClick={() => { setEditingTags(key); setTagDrafts((d) => ({ ...d, [key]: [] })); }} className="text-body-sm text-gray-400 hover:text-gray-600">
                          + Add tags
                        </button>
                      )}
                    </div>

                    {/* note */}
                    <div className="mt-3">
                      {editingNote === key ? (
                        <div className="rounded-lg border border-gray-200 p-3 bg-gray-50">
                          <textarea
                            rows={3}
                            value={noteDrafts[key] ?? item.note ?? ''}
                            onChange={(e) => setNoteDrafts((d) => ({ ...d, [key]: e.target.value }))}
                            placeholder="Private note for your recruitment team — the candidate never sees this."
                            className="hf-textarea"
                          />
                          <div className="flex items-center gap-2 mt-2">
                            <button onClick={() => saveNote(item)} disabled={busyId === `note:${key}`} className="hf-btn hf-btn-primary hf-btn-sm">
                              <Check size={14} /> Save note
                            </button>
                            <button onClick={() => { setEditingNote(null); setNoteDrafts((d) => ({ ...d, [key]: undefined })); }} className="hf-btn hf-btn-ghost hf-btn-sm">Cancel</button>
                          </div>
                        </div>
                      ) : item.note ? (
                        <button onClick={() => { setEditingNote(key); setNoteDrafts((d) => ({ ...d, [key]: item.note ?? '' })); }} className="w-full text-left flex items-start gap-1.5 text-body-sm p-2 rounded-lg hover:bg-gray-50" style={{ color: 'var(--gray-600)' }}>
                          <StickyNote size={13} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--gray-400)' }} />
                          <span className="italic line-clamp-2">"{item.note}"</span>
                        </button>
                      ) : (
                        <button onClick={() => { setEditingNote(key); setNoteDrafts((d) => ({ ...d, [key]: '' })); }} className="flex items-center gap-1.5 text-body-sm p-2 rounded-lg hover:bg-gray-50" style={{ color: 'var(--gray-400)' }}>
                          <StickyNote size={13} /> Add a note
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

function FileGlyph() {
  return <User size={13} />;
}