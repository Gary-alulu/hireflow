'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Users, FileText, ChevronLeft, Calendar, Check, Search, Download, AlertCircle, Link2, User, Columns3, StickyNote, Loader2, Tag as TagIcon } from 'lucide-react';
import { getMatchScoreBadge, timeAgo, getCvDownloadUrl } from '@/lib/utils';
import {
  APPLICATION_STATUSES,
  hasMatchScore,
  tallyApplicationsByStatus,
} from '@/lib/pipeline';
import PageTransition from '@/components/PageTransition';
import MatchBreakdown from '@/components/MatchBreakdown';
import MessageThread from '@/components/MessageThread';
import TagEditor from '@/components/TagEditor';
import Select from '@/components/ui/Select';

const INTERVIEW_TYPE_OPTIONS = [
  { value: 'Video', label: 'Video Call' },
  { value: 'Phone', label: 'Phone Screen' },
  { value: 'In-Person', label: 'In-Person' },
  { value: 'Technical', label: 'Technical Assessment' },
];

export default function JobApplicantsPage() {
  const params = useParams();
  // The current recruiter drives candid->recruiter reads; messages identify the
  // sender by this id so the API can compute the counterparty.
  const [sessionUserId, setSessionUserId] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [showScheduler, setShowScheduler] = useState(null);
  const [showReview, setShowReview] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({ interviewType: 'Video', scheduledDate: '', locationOrLink: '', notes: '', interviewerName: '' });
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [filterStage, setFilterStage] = useState('All');
  const [updateError, setUpdateError] = useState(null);
  const [savedId, setSavedId] = useState(null);
  const [noteDrafts, setNoteDrafts] = useState({});
  const [noteSavingId, setNoteSavingId] = useState(null);
  const [noteEditingId, setNoteEditingId] = useState(null);
  const [tagDrafts, setTagDrafts] = useState({});
  const savedTimer = useRef(null);

  useEffect(() => {
    fetch('/api/auth/session')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data?.user?.userId && setSessionUserId(data.user.userId))
      .catch(() => {});
  }, []);

  useEffect(() => () => clearTimeout(savedTimer.current), []);

  const fetchApplicants = useCallback(async () => {
    try {
      const res = await fetch(`/api/applications?jobId=${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications);
      }
    } catch (error) {
      console.error('Failed to fetch applicants', error);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchApplicants();
  }, [fetchApplicants]);

  const updateStage = async (appId, newStatus) => {
    setUpdatingId(appId);
    setUpdateError(null);
    setSavedId(null);
    try {
      const res = await fetch(`/api/applications/${appId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({}));
        setUpdateError(error || 'Could not update stage');
        return;
      }
      setApplications(prev =>
        prev.map(app => app._id === appId ? { ...app, status: newStatus } : app)
      );
      setSavedId(appId);
      clearTimeout(savedTimer.current);
      savedTimer.current = setTimeout(() => setSavedId(null), 1600);
    } catch (err) {
      console.error('Failed to update stage', err);
      setUpdateError('Could not update stage');
    } finally {
      setUpdatingId(null);
    }
  };

  const saveNote = async (app) => {
    const text = (noteDrafts[app._id] ?? app.recruiterNotes ?? '').trim();
    if (text === (app.recruiterNotes ?? '')) {
      setNoteEditingId(null);
      return;
    }
    setNoteSavingId(app._id);
    setUpdateError(null);
    try {
      const res = await fetch(`/api/applications/${app._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recruiterNotes: text }),
      });
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({}));
        setUpdateError(error || 'Could not save note');
        return;
      }
      setApplications((prev) => prev.map((a) => (a._id === app._id ? { ...a, recruiterNotes: text } : a)));
      setNoteEditingId(null);
    } catch (err) {
      console.error('Failed to save note', err);
      setUpdateError('Could not save note');
    } finally {
      setNoteSavingId(null);
    }
  };

  const submitInterview = async (app) => {
    setScheduleLoading(true);
    try {
      const res = await fetch('/api/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: app._id,
          jobId: params.id,
          candidateId: app.candidateId._id,
          ...scheduleForm,
        }),
      });
      if (res.ok) {
        setShowScheduler(null);
        setScheduleForm({ interviewType: 'Video', scheduledDate: '', locationOrLink: '', notes: '', interviewerName: '' });
        await updateStage(app._id, 'Interview');
      }
    } catch (err) {
      console.error('Failed to schedule interview', err);
    } finally {
      setScheduleLoading(false);
    }
  };

  const filteredApps = filterStage === 'All' ? applications : applications.filter(a => a.status === filterStage);
  const stageCounts = tallyApplicationsByStatus(applications);

  return (
    <PageTransition key={loading ? 'loading' : 'ready'}>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/dashboard/recruiter/jobs/${params.id}`} transitionTypes={['nav-back']} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
              <ChevronLeft size={20} />
            </Link>
            <div>
              <h1 className="text-h2 flex items-center gap-3" style={{ color: 'var(--gray-900)' }}>
                Applicants
                <span className="hf-badge bg-blue-50 text-blue-700 border border-blue-200 text-sm">
                  {applications.length}
                </span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/dashboard/recruiter/jobs/${params.id}/pipeline`}
              className="hf-btn hf-btn-secondary h-10"
            >
              <Columns3 size={16} /> Board view
            </Link>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input type="text" placeholder="Search applicants..." className="hf-input pl-9 h-10 w-64 text-sm" />
            </div>
            <button className="hf-btn hf-btn-secondary h-10">
              <Download size={16} /> Export
            </button>
          </div>
        </div>

        {/* Stage Filter Tabs */}
        <div className="flex overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar">
          <div className="flex items-center gap-2 border-b border-gray-200 w-full">
            <button
              onClick={() => setFilterStage('All')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${filterStage === 'All' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              All Candidates
            </button>
            {APPLICATION_STATUSES.map(stage => {
              const count = stageCounts[stage];
              return (
                <button
                  key={stage}
                  onClick={() => setFilterStage(stage)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${filterStage === stage ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                  {stage}
                  {count > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-xs hf-pop ${filterStage === stage ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {updateError && (
          <div className="hf-alert hf-alert-error items-center" role="alert">
            <AlertCircle size={18} className="flex-shrink-0" />
            <span>{updateError}</span>
            <button onClick={() => setUpdateError(null)} className="ml-auto hf-btn hf-btn-ghost hf-btn-sm">
              Dismiss
            </button>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="hf-skeleton h-32 w-full rounded-xl"></div>
            <div className="hf-skeleton h-32 w-full rounded-xl"></div>
            <div className="hf-skeleton h-32 w-full rounded-xl"></div>
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="hf-empty hf-card">
            <Users size={48} className="text-gray-300 mb-4" />
            <h3 className="text-h3" style={{ color: 'var(--gray-900)' }}>No applicants found</h3>
            <p className="text-body mt-2" style={{ color: 'var(--color-text-secondary)' }}>
              {filterStage === 'All' ? 'Share your job posting to get more candidates.' : `No candidates currently in the "${filterStage}" stage.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApps.map((app) => (
              <div key={app._id} className="hf-card p-5 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  
                  {/* Candidate Info */}
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg flex-shrink-0">
                      {app.candidateId?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-body-lg font-semibold" style={{ color: 'var(--gray-900)' }}>{app.candidateId?.name}</h3>
                        {hasMatchScore(app.matchScore) && (
                          <span className={getMatchScoreBadge(app.matchScore)}>
                            {app.matchScore}% AI Match
                          </span>
                        )}
                      </div>
                      <p className="text-body-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>{app.candidateId?.email}</p>
                      <div className="flex flex-wrap items-center gap-4 mt-3 text-body-sm" style={{ color: 'var(--color-text-muted)' }}>
                        <span>Applied {timeAgo(app.createdAt)}</span>
                        {app.cvUrl && (
                          <a href={getCvDownloadUrl(app.cvUrl)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-medium transition-colors">
                            <FileText size={14} /> View Resume
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-end gap-3 sm:ml-auto">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <Select
                        className="w-full sm:w-auto min-w-[140px]"
                        triggerClassName="bg-gray-50"
                        value={app.status}
                        disabled={updatingId === app._id}
                        onChange={(value) => updateStage(app._id, value)}
                        options={APPLICATION_STATUSES.map((stage) => ({ value: stage, label: stage }))}
                        ariaLabel={`Change stage for ${app.candidateId?.name || 'candidate'}`}
                        menuMinWidth={170}
                      />
                      <button
                        onClick={() => setShowScheduler(showScheduler === app._id ? null : app._id)}
                        className="hf-btn hf-btn-secondary h-9 whitespace-nowrap"
                      >
                        <Calendar size={14} /> Schedule
                      </button>
                      <button
                        onClick={() => setShowReview(showReview === app._id ? null : app._id)}
                        className="hf-btn hf-btn-ghost h-9 whitespace-nowrap"
                      >
                        <FileText size={14} /> {showReview === app._id ? 'Hide review' : 'Review'}
                      </button>
                    </div>
                    {updatingId === app._id && <span className="text-caption text-blue-600 animate-pulse">Saving...</span>}
                    {savedId === app._id && updatingId !== app._id && (
                      <span className="text-caption hf-confirm"><Check size={12} /> Stage updated</span>
                    )}
                  </div>
                </div>

                {/* Inline interview scheduler */}
                {showScheduler === app._id && (
                  <div className="mt-5 p-5 bg-gray-50 rounded-xl border border-gray-200">
                    <h4 className="text-body font-semibold mb-4" style={{ color: 'var(--gray-900)' }}>Schedule Interview with {app.candidateId?.name}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="hf-field mb-0">
                        <label className="hf-label">Interview Type</label>
                        <Select
                          value={scheduleForm.interviewType}
                          onChange={(value) => setScheduleForm((prev) => ({ ...prev, interviewType: value }))}
                          options={INTERVIEW_TYPE_OPTIONS}
                          ariaLabel="Interview type"
                        />
                      </div>
                      <div className="hf-field mb-0">
                        <label className="hf-label">Date & Time</label>
                        <input
                          type="datetime-local"
                          value={scheduleForm.scheduledDate}
                          onChange={(e) => setScheduleForm(prev => ({ ...prev, scheduledDate: e.target.value }))}
                          className="hf-input"
                        />
                      </div>
                      <div className="sm:col-span-2 hf-field mb-0">
                        <label className="hf-label">Interviewer</label>
                        <input
                          type="text"
                          placeholder="e.g. Jane Doe"
                          value={scheduleForm.interviewerName}
                          onChange={(e) => setScheduleForm(prev => ({ ...prev, interviewerName: e.target.value }))}
                          className="hf-input"
                        />
                      </div>
                      <div className="sm:col-span-2 hf-field mb-0">
                        <label className="hf-label">Meeting Link / Location</label>
                        <input
                          type="text"
                          placeholder="e.g. Google Meet link or office address"
                          value={scheduleForm.locationOrLink}
                          onChange={(e) => setScheduleForm(prev => ({ ...prev, locationOrLink: e.target.value }))}
                          className="hf-input"
                        />
                      </div>
                      <div className="sm:col-span-2 hf-field mb-0">
                        <label className="hf-label">Notes for Candidate (Optional)</label>
                        <textarea
                          rows={2}
                          value={scheduleForm.notes}
                          onChange={(e) => setScheduleForm(prev => ({ ...prev, notes: e.target.value }))}
                          className="hf-textarea"
                          placeholder="Instructions or things to prepare..."
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-5">
                      <button onClick={() => setShowScheduler(null)} className="hf-btn hf-btn-ghost">Cancel</button>
                      <button
                        onClick={() => submitInterview(app)}
                        disabled={scheduleLoading || !scheduleForm.scheduledDate || !scheduleForm.locationOrLink}
                        className="hf-btn hf-btn-primary"
                      >
                        {scheduleLoading ? (
                          'Scheduling...'
                        ) : (
                          <><Check size={16} /> Confirm Schedule</>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Inline application review */}
                {showReview === app._id && (
                  <div className="mt-5 p-5 bg-gray-50 rounded-xl border border-gray-200 space-y-5">
                    {(app.candidateInfo?.headline || app.candidateInfo?.phone || app.candidateInfo?.location || app.candidateInfo?.skills?.length) && (
                      <div>
                        <h4 className="text-body font-semibold mb-3 flex items-center gap-1.5" style={{ color: 'var(--gray-900)' }}>
                          <User size={14} /> Candidate Profile
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>
                          {app.candidateInfo.name && <span>Name: <strong style={{ color: 'var(--gray-800)' }}>{app.candidateInfo.name}</strong></span>}
                          {app.candidateInfo.email && <span>Email: <strong style={{ color: 'var(--gray-800)' }}>{app.candidateInfo.email}</strong></span>}
                          {app.candidateInfo.phone && <span>Phone: <strong style={{ color: 'var(--gray-800)' }}>{app.candidateInfo.phone}</strong></span>}
                          {app.candidateInfo.location && <span>Location: <strong style={{ color: 'var(--gray-800)' }}>{app.candidateInfo.location}</strong></span>}
                        </div>
                        {app.candidateInfo.headline && (
                          <p className="text-body-sm mt-2 font-medium" style={{ color: 'var(--gray-700)' }}>{app.candidateInfo.headline}</p>
                        )}
                        {app.candidateInfo.skills?.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {app.candidateInfo.skills.map((skill, i) => (
                              <span key={i} className="px-2.5 py-1 bg-white text-gray-700 text-xs font-medium rounded border border-gray-200">{skill}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {app.coverLetter && (
                      <div>
                        <h4 className="text-body font-semibold mb-2" style={{ color: 'var(--gray-900)' }}>Cover Letter</h4>
                        <p className="text-body whitespace-pre-wrap" style={{ color: 'var(--gray-700)' }}>{app.coverLetter}</p>
                      </div>
                    )}

                    {app.portfolioUrl && (
                      <div>
                        <h4 className="text-body font-semibold mb-2" style={{ color: 'var(--gray-900)' }}>Portfolio</h4>
                        <a href={app.portfolioUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-medium transition-colors">
                          <Link2 size={14} /> {app.portfolioUrl}
                        </a>
                      </div>
                    )}

                    {app.answers?.length > 0 && (
                      <div>
                        <h4 className="text-body font-semibold mb-3" style={{ color: 'var(--gray-900)' }}>Application Answers</h4>
                        <div className="space-y-4">
                          {app.answers.map((a, i) => (
                            <div key={i}>
                              <p className="text-body-sm font-medium mb-1" style={{ color: 'var(--gray-800)' }}>{a.question}</p>
                              <p className="text-body whitespace-pre-wrap" style={{ color: 'var(--gray-700)' }}>{a.answer}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {!app.coverLetter && !app.portfolioUrl && !(app.answers?.length > 0) && (
                      <p className="text-body-sm" style={{ color: 'var(--color-text-muted)' }}>
                        The candidate submitted this application without extra materials.
                      </p>
                    )}

                    {typeof app.matchScore === 'number' && (
                      <MatchBreakdown application={app} />
                    )}

                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                      <MessageThread applicationId={app._id} currentUserId={sessionUserId} />
                    </div>

                    {/* Tags (recruiter-only view) */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                      <h4 className="text-body-sm font-semibold mb-2 flex items-center gap-1.5" style={{ color: 'var(--gray-900)' }}>
                        <TagIcon size={14} /> Tags
                        <span className="text-caption font-normal" style={{ color: 'var(--color-text-muted)' }}>team only — candidates never see these</span>
                      </h4>
                      <TagEditor
                        value={tagDrafts[app._id] ?? app.tags ?? []}
                        onChange={(tags) => setTagDrafts((d) => ({ ...d, [app._id]: tags }))}
                      />
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={async () => {
                            const tags = tagDrafts[app._id] ?? app.tags ?? [];
                            setUpdateError(null);
                            try {
                              const res = await fetch(`/api/applications/${app._id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ tags }),
                              });
                              if (!res.ok) {
                                const { error } = await res.json().catch(() => ({}));
                                setUpdateError(error || 'Could not save tags');
                                return;
                              }
                              setApplications((prev) => prev.map((a) => (a._id === app._id ? { ...a, tags } : a)));
                              setTagDrafts((d) => ({ ...d, [app._id]: tags }));
                            } catch (err) {
                              console.error('Failed to save tags', err);
                              setUpdateError('Could not save tags');
                            }
                          }}
                          className="hf-btn hf-btn-primary hf-btn-sm"
                        >
                          <Check size={14} /> Save tags
                        </button>
                      </div>
                    </div>

                    {/* Recruiter note (private to the recruitment team) */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                      <h4 className="text-body-sm font-semibold mb-2 flex items-center gap-1.5" style={{ color: 'var(--gray-900)' }}>
                        <StickyNote size={14} /> Private Recruiter Note
                        <span className="text-caption font-normal" style={{ color: 'var(--color-text-muted)' }}>team only — candidates never see this</span>
                      </h4>
                      {noteEditingId === app._id ? (
                        <div>
                          <textarea
                            rows={3}
                            value={noteDrafts[app._id] ?? app.recruiterNotes ?? ''}
                            onChange={(e) => setNoteDrafts((d) => ({ ...d, [app._id]: e.target.value }))}
                            placeholder="e.g. Strong technical background. Good communication during interview."
                            className="hf-textarea"
                          />
                          <div className="flex items-center gap-2 mt-2">
                            <button onClick={() => saveNote(app)} disabled={noteSavingId === app._id} className="hf-btn hf-btn-primary hf-btn-sm">
                              {noteSavingId === app._id && <Loader2 size={14} className="animate-spin" />}
                              <Check size={14} /> Save note
                            </button>
                            <button
                              onClick={() => {
                                setNoteEditingId(null);
                                setNoteDrafts((d) => ({ ...d, [app._id]: app.recruiterNotes ?? '' }));
                              }}
                              className="hf-btn hf-btn-ghost hf-btn-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        app.recruiterNotes ? (
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-body-sm italic whitespace-pre-wrap" style={{ color: 'var(--gray-600)' }}>"{app.recruiterNotes}"</p>
                            <button onClick={() => { setNoteEditingId(app._id); setNoteDrafts((d) => ({ ...d, [app._id]: app.recruiterNotes })); }} className="hf-btn hf-btn-ghost hf-btn-sm flex-shrink-0">
                              Edit
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => { setNoteEditingId(app._id); setNoteDrafts((d) => ({ ...d, [app._id]: '' })); }} className="hf-btn hf-btn-secondary hf-btn-sm">
                            <StickyNote size={14} /> Add note
                          </button>
                        )
                      )}
                    </div>
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
