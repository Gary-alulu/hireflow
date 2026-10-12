'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Search, MapPin, Briefcase, Mail, User, Filter, Check, X, StickyNote,
  Calendar, MessageSquareText, Bookmark, BookmarkCheck, Tag as TagIcon,
} from 'lucide-react';
import { getMatchScoreBadge, getStatusBadgeClass, timeAgo, getCvDownloadUrl } from '@/lib/utils';
import { APPLICATION_STATUSES } from '@/lib/pipeline';
import PageTransition from '@/components/PageTransition';
import MessageThread from '@/components/MessageThread';
import TagEditor from '@/components/TagEditor';
import Select from '@/components/ui/Select';

const MIN_SCORE_OPTIONS = [
  { value: '', label: 'Any' },
  { value: '50', label: '50+' },
  { value: '75', label: '75+' },
  { value: '85', label: '85+' },
];

const MIN_YEARS_OPTIONS = [
  { value: '', label: 'Any' },
  { value: '1', label: '1+' },
  { value: '3', label: '3+' },
  { value: '5', label: '5+' },
  { value: '8', label: '8+' },
];

const STAGE_OPTIONS = [
  { value: '', label: 'All stages' },
  ...APPLICATION_STATUSES.map((status) => ({ value: status, label: status })),
];

const DEFAULT_FILTERS = {
  jobId: '',
  stage: '',
  minScore: '',
  minYears: '',
  skills: '',
  location: '',
  appliedAfter: '',
  showFilters: false,
};

export default function CandidatesPage() {
  const [q, setQ] = useState('');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [candidates, setCandidates] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [sessionUserId, setSessionUserId] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState('');
  const [noteDrafts, setNoteDrafts] = useState({});
  const [editingNote, setEditingNote] = useState(null);
  const [openThread, setOpenThread] = useState(null);
  const [savedIds, setSavedIds] = useState(new Set());
  const [savingId, setSavingId] = useState(null);
  const [tagEditing, setTagEditing] = useState(null);
  const [tagDrafts, setTagDrafts] = useState({});

  useEffect(() => {
    fetch('/api/talent-pool')
      .then((r) => (r.ok ? r.json() : { saved: [] }))
      .then((data) => setSavedIds(new Set((data.saved || []).map((s) => String(s.candidate._id)))))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch('/api/auth/session')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data?.user?.userId && setSessionUserId(data.user.userId))
      .catch(() => {});
    fetch('/api/jobs')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setJobs(data?.jobs || []))
      .catch(() => {});
  }, []);

  const runSearch = useCallback(async () => {
    setLoading(true);
    setActionError('');
    try {
      const params = new URLSearchParams();
      params.set('pool', '1');
      if (q.trim()) params.set('search', q.trim());
      if (filters.jobId) params.set('jobId', filters.jobId);
      if (filters.stage) params.set('stage', filters.stage);
      if (filters.minScore) params.set('minMatchScore', filters.minScore);
      if (filters.minYears) params.set('minExperience', filters.minYears);
      if (filters.skills.trim()) params.set('skill', filters.skills.trim());
      if (filters.location.trim()) params.set('location', filters.location.trim());
      if (filters.appliedAfter) params.set('appliedAfter', new Date(`${filters.appliedAfter}T00:00:00`).toISOString());

      const res = await fetch(`/api/candidates?${params.toString()}`);
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({}));
        setActionError(error || 'Search failed');
        return;
      }
      const data = await res.json();
      setCandidates(data.candidates || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Failed to search candidates:', error);
    } finally {
      setLoading(false);
    }
  }, [q, filters]);

  useEffect(() => {
    runSearch();
  }, [runSearch]);

  const submitSearch = (e) => {
    e.preventDefault();
    runSearch();
  };

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setQ('');
    setTimeout(runSearch, 0);
  };

  const moveStage = async (appId, status) => {
    setBusyId(appId);
    setActionError('');
    try {
      const res = await fetch(`/api/applications/${appId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({}));
        setActionError(error || 'Could not update stage');
        return;
      }
      await runSearch();
    } catch (error) {
      console.error('Failed to move stage', error);
      setActionError('Could not update stage');
    } finally {
      setBusyId(null);
    }
  };

  const saveNote = async (candidate) => {
    const text = (noteDrafts[candidate.applicationId] ?? candidate.recruiterNotes ?? '').trim();
    setBusyId(candidate.applicationId);
    setActionError('');
    try {
      const res = await fetch(`/api/applications/${candidate.applicationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recruiterNotes: text }),
      });
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({}));
        setActionError(error || 'Could not save note');
        return;
      }
      setEditingNote(null);
      setNoteDrafts((d) => ({ ...d, [candidate.applicationId]: text }));
      await runSearch();
    } catch (error) {
      console.error('Failed to save note', error);
      setActionError('Could not save note');
    } finally {
      setBusyId(null);
    }
  };

  const initials = (name) =>
    String(name || '')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || '?';

  const toggleSave = async (candidate) => {
    const userId = String(candidate.candidateId);
    const isSaved = savedIds.has(userId);
    setSavingId(candidate.applicationId);
    setActionError('');
    try {
      const opts = isSaved
        ? { method: 'DELETE' }
        : { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ candidateId: userId }) };
      const res = await fetch(`/api/talent-pool${isSaved ? `?candidateId=${userId}` : ''}`, opts);
      if (res.ok || res.status === 404) {
        setSavedIds((prev) => {
          const next = new Set(prev);
          if (isSaved) next.delete(userId);
          else next.add(userId);
          return next;
        });
      } else {
        const { error } = await res.json().catch(() => ({}));
        setActionError(error || 'Could not update talent pool');
      }
    } catch (error) {
      console.error('Failed to update talent pool', error);
      setActionError('Could not update talent pool');
    } finally {
      setSavingId(null);
    }
  };

  const updateTags = async (candidate, tags) => {
    setBusyId(candidate.applicationId);
    setActionError('');
    try {
      const res = await fetch(`/api/applications/${candidate.applicationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags }),
      });
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({}));
        setActionError(error || 'Could not update tags');
        return;
      }
      setTagEditing(null);
      await runSearch();
    } catch (error) {
      console.error('Failed to update tags', error);
      setActionError('Could not update tags');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-h2" style={{ color: 'var(--gray-900)' }}>Candidate Pool</h1>
          <p className="text-body mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            Search applicants across your jobs, filter by match score, stage, skills, experience and more, and act on candidates right from the card.
          </p>
        </div>

        {actionError && (
          <div className="hf-alert hf-alert-error items-center" role="alert">
            <X size={18} className="flex-shrink-0" />
            <span>{actionError}</span>
            <button onClick={() => setActionError('')} className="ml-auto hf-btn hf-btn-ghost hf-btn-sm">Dismiss</button>
          </div>
        )}

        {/* Search */}
        <form onSubmit={submitSearch} className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, skill, role, company, location…"
              className="hf-input pl-9"
            />
          </div>
          <button
            type="button"
            onClick={() => setFilters((f) => ({ ...f, showFilters: !f.showFilters }))}
            className={`hf-btn ${filters.showFilters ? 'hf-btn-primary' : 'hf-btn-secondary'}`}
          >
            <Filter size={15} /> Filters
          </button>
          <button type="submit" className="hf-btn hf-btn-primary">Search</button>
        </form>

        {/* Filters */}
        {filters.showFilters && (
          <div className="hf-card p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="hf-field mb-0">
              <label className="hf-label">Job</label>
              <Select
                value={filters.jobId}
                onChange={(value) => setFilters((f) => ({ ...f, jobId: value }))}
                options={[{ value: '', label: 'All my jobs' }, ...jobs.map((job) => ({ value: job._id, label: job.title }))]}
                ariaLabel="Filter by job"
              />
            </div>
            <div className="hf-field mb-0">
              <label className="hf-label">Stage</label>
              <Select
                value={filters.stage}
                onChange={(value) => setFilters((f) => ({ ...f, stage: value }))}
                options={STAGE_OPTIONS}
                ariaLabel="Filter by stage"
              />
            </div>
            <div className="hf-field mb-0">
              <label className="hf-label">Min match score</label>
              <Select
                value={filters.minScore}
                onChange={(value) => setFilters((f) => ({ ...f, minScore: value }))}
                options={MIN_SCORE_OPTIONS}
                ariaLabel="Minimum match score"
              />
            </div>
            <div className="hf-field mb-0">
              <label className="hf-label">Min experience (years)</label>
              <Select
                value={filters.minYears}
                onChange={(value) => setFilters((f) => ({ ...f, minYears: value }))}
                options={MIN_YEARS_OPTIONS}
                ariaLabel="Minimum experience"
              />
            </div>
            <div className="hf-field mb-0">
              <label className="hf-label">Skills (comma-separated, all required)</label>
              <input
                type="text"
                value={filters.skills}
                onChange={(e) => setFilters((f) => ({ ...f, skills: e.target.value }))}
                className="hf-input"
                placeholder="React, Next.js"
              />
            </div>
            <div className="hf-field mb-0">
              <label className="hf-label">Location</label>
              <input
                type="text"
                value={filters.location}
                onChange={(e) => setFilters((f) => ({ ...f, location: e.target.value }))}
                className="hf-input"
                placeholder="New York"
              />
            </div>
            <div className="hf-field mb-0">
              <label className="hf-label">Applied after</label>
              <input
                type="date"
                value={filters.appliedAfter}
                onChange={(e) => setFilters((f) => ({ ...f, appliedAfter: e.target.value }))}
                className="hf-input"
              />
            </div>
            <div className="flex items-end">
              <button type="button" onClick={clearFilters} className="hf-btn hf-btn-ghost hf-btn-sm w-full">
                Clear all
              </button>
            </div>
          </div>
        )}

        <p className="text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>
          {total} candidate{total === 1 ? '' : 's'} in your pool
        </p>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="hf-card p-6 h-80 hf-skeleton"></div>
            ))}
          </div>
        ) : candidates.length === 0 ? (
          <div className="hf-empty hf-card">
            <Search className="mx-auto h-12 w-12" style={{ color: 'var(--gray-400)' }} />
            <h3 className="text-h4 mt-4" style={{ color: 'var(--gray-900)' }}>No candidates found</h3>
            <p className="text-body mt-2" style={{ color: 'var(--color-text-secondary)' }}>
              Adjust your search or filters, or check the applicants of your jobs.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {candidates.map((c) => (
              <div key={c.applicationId} className="hf-card flex flex-col p-6 hover:shadow-md transition-shadow">
                {/* header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="h-12 w-12 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: 'var(--brand-100)', color: 'var(--brand-700)' }}>
                    {c.profilePhoto ? (
                      <img src={c.profilePhoto} alt={c.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="font-semibold text-sm">{initials(c.name)}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-h4 truncate" style={{ color: 'var(--gray-900)' }}>{c.name}</h3>
                    <p className="text-body-sm truncate" style={{ color: 'var(--brand-600)' }}>{c.headline || c.jobTitle}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleSave(c)}
                      disabled={savingId === c.applicationId}
                      title={savedIds.has(String(c.candidateId)) ? 'Remove from talent pool' : 'Save to talent pool'}
                      className="p-2 rounded-lg transition-colors"
                      style={{
                        backgroundColor: savedIds.has(String(c.candidateId)) ? 'var(--brand-50)' : 'transparent',
                        color: savedIds.has(String(c.candidateId)) ? 'var(--brand-700)' : 'var(--gray-400)',
                      }}
                    >
                      {savedIds.has(String(c.candidateId)) ? <BookmarkCheck size={17} /> : <Bookmark size={17} />}
                    </button>
                    {typeof c.matchScore === 'number' && (
                      <span className={getMatchScoreBadge(c.matchScore)}>{c.matchScore}%</span>
                    )}
                  </div>
                </div>

                {/* meta */}
                <div className="space-y-1.5 mb-4 text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">{c.location || 'Location not specified'} {c.experienceYears > 0 ? `· ${c.experienceYears} yrs` : ''}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">Applied to {c.jobTitle || 'a job'} · {c.appliedAt ? timeAgo(c.appliedAt) : ''}</span>
                  </div>
                  {c.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="truncate">{c.email}</span>
                    </div>
                  )}
                </div>

                {/* stage */}
                <div className="mb-4 flex items-center gap-2">
                  <span className={getStatusBadgeClass(c.status)}>{c.status}</span>
                  <Select
                    value={c.status}
                    disabled={busyId === c.applicationId}
                    onChange={(value) => moveStage(c.applicationId, value)}
                    options={APPLICATION_STATUSES.map((status) => ({ value: status, label: status }))}
                    size="sm"
                    ariaLabel={`Change stage for ${c.name}`}
                    className="ml-auto w-auto"
                    menuMinWidth={170}
                  />
                </div>

                {/* skills */}
                {c.skills.length > 0 && (
                  <div className="mb-4 flex-1">
                    <div className="flex flex-wrap gap-1.5">
                      {c.skills.slice(0, 5).map((skill, idx) => (
                        <span key={idx} className="hf-badge" style={{ backgroundColor: 'var(--gray-100)', color: 'var(--gray-700)' }}>
                          {skill}
                        </span>
                      ))}
                      {c.skills.length > 5 && (
                        <span className="hf-badge" style={{ backgroundColor: 'var(--gray-50)', color: 'var(--gray-500)' }}>
                          +{c.skills.length - 5}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* tags */}
                <div className="mb-4">
                  {tagEditing === c.applicationId ? (
                    <div className="rounded-lg border border-gray-200 p-3 bg-gray-50">
                      <TagEditor
                        value={tagDrafts[c.applicationId] ?? c.tags ?? []}
                        onChange={(tags) => setTagDrafts((d) => ({ ...d, [c.applicationId]: tags }))}
                      />
                      <div className="flex items-center gap-2 mt-2">
                        <button onClick={() => { updateTags(c, tagDrafts[c.applicationId] ?? []); setTagDrafts((d) => ({ ...d, [c.applicationId]: undefined })); }} disabled={busyId === c.applicationId} className="hf-btn hf-btn-primary hf-btn-sm">
                          <Check size={14} /> Save tags
                        </button>
                        <button onClick={() => { setTagEditing(null); setTagDrafts((d) => ({ ...d, [c.applicationId]: undefined })); }} className="hf-btn hf-btn-ghost hf-btn-sm">Cancel</button>
                      </div>
                    </div>
                  ) : (c.tags || []).length > 0 ? (
                    <button onClick={() => setTagEditing(c.applicationId)} className="w-full flex flex-wrap items-center gap-1.5 text-left text-body-sm p-2 rounded-lg hover:bg-gray-50" style={{ color: 'var(--gray-600)' }}>
                      <TagIcon size={13} className="flex-shrink-0" style={{ color: 'var(--gray-400)' }} />
                      {c.tags.map((tag) => (
                        <span key={tag} className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: 'var(--brand-50)', color: 'var(--brand-700)', border: '1px solid var(--brand-200)' }}>
                          {tag}
                        </span>
                      ))}
                    </button>
                  ) : (
                    <button onClick={() => setTagEditing(c.applicationId)} className="w-full flex items-center gap-1.5 text-body-sm p-2 rounded-lg hover:bg-gray-50" style={{ color: 'var(--gray-400)' }}>
                      <TagIcon size={13} /> Add tags
                    </button>
                  )}
                </div>

                {/* recruiter note */}
                <div className="mb-4">
                  {editingNote === c.applicationId ? (
                    <div className="rounded-lg border border-gray-200 p-2 bg-gray-50">
                      <textarea
                        rows={3}
                        value={noteDrafts[c.applicationId] ?? c.recruiterNotes ?? ''}
                        onChange={(e) => setNoteDrafts((d) => ({ ...d, [c.applicationId]: e.target.value }))}
                        placeholder="Private note for your recruitment team — candidates never see this."
                        className="hf-textarea"
                      />
                      <div className="flex items-center gap-2 mt-2">
                        <button onClick={() => saveNote(c)} disabled={busyId === c.applicationId} className="hf-btn hf-btn-primary hf-btn-sm">
                          <Check size={14} /> Save note
                        </button>
                        <button onClick={() => { setEditingNote(null); setNoteDrafts((d) => ({ ...d, [c.applicationId]: c.recruiterNotes ?? '' })); }} className="hf-btn hf-btn-ghost hf-btn-sm">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    c.recruiterNotes ? (
                      <button onClick={() => { setEditingNote(c.applicationId); setNoteDrafts((d) => ({ ...d, [c.applicationId]: c.recruiterNotes })); }} className="w-full text-left flex items-start gap-1.5 text-body-sm p-2 rounded-lg hover:bg-gray-50" style={{ color: 'var(--gray-600)' }}>
                        <StickyNote size={13} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--gray-400)' }} />
                        <span className="line-clamp-2 italic">"{c.recruiterNotes}"</span>
                      </button>
                    ) : (
                      <button onClick={() => { setEditingNote(c.applicationId); setNoteDrafts((d) => ({ ...d, [c.applicationId]: '' })); }} className="w-full flex items-center gap-1.5 text-body-sm p-2 rounded-lg hover:bg-gray-50" style={{ color: 'var(--gray-400)' }}>
                        <StickyNote size={13} /> Add a private note
                      </button>
                    )
                  )}
                </div>

                {/* actions */}
                <div className="mt-auto pt-4 border-t grid grid-cols-3 gap-2" style={{ borderColor: 'var(--color-border)' }}>
                  <button onClick={() => moveStage(c.applicationId, 'Shortlisted')} disabled={busyId === c.applicationId} className="hf-btn hf-btn-secondary hf-btn-sm">
                    <Check size={13} /> Shortlist
                  </button>
                  <button onClick={() => moveStage(c.applicationId, 'Rejected')} disabled={busyId === c.applicationId} className="hf-btn hf-btn-ghost hf-btn-sm text-red-600 hover:text-red-700">
                    <X size={13} /> Reject
                  </button>
                  <button onClick={() => setOpenThread(openThread === c.applicationId ? null : c.applicationId)} className="hf-btn hf-btn-secondary hf-btn-sm">
                    <MessageSquareText size={13} /> Message
                  </button>
                  <Link
                    href={`/dashboard/recruiter/jobs/${c.jobId}/applicants`}
                    className="col-span-2 hf-btn hf-btn-secondary hf-btn-sm justify-center"
                  >
                    <Calendar size={13} /> Full review & schedule
                  </Link>
                  {c.cvUrl && (
                    <a href={getCvDownloadUrl(c.cvUrl)} target="_blank" rel="noopener noreferrer" className="hf-btn hf-btn-ghost hf-btn-sm justify-center">
                      <User size={13} /> CV
                    </a>
                  )}
                </div>

                {openThread === c.applicationId && (
                  <div className="mt-4 bg-gray-50 rounded-xl border border-gray-200 p-4">
                    <MessageThread applicationId={c.applicationId} currentUserId={sessionUserId} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}