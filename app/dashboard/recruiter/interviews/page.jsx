'use client';

import { useState, useEffect, useCallback } from 'react';
import { Calendar, Video, MapPin, Phone, Clock, User, Check, X, RefreshCcw, Link2 } from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import Select from '@/components/ui/Select';

const EMPTY = { scheduledDate: '', locationOrLink: '', notes: '', interviewerName: '', interviewType: 'Video' };

const INTERVIEW_TYPE_OPTIONS = [
  { value: 'Video', label: 'Video Call' },
  { value: 'Phone', label: 'Phone Screen' },
  { value: 'In-Person', label: 'In-Person' },
  { value: 'Technical', label: 'Technical Assessment' },
];

export default function RecruiterInterviewsPage() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY);
  const [error, setError] = useState('');

  const fetchInterviews = useCallback(async () => {
    try {
      const res = await fetch('/api/interviews');
      if (res.ok) {
        const data = await res.json();
        setInterviews(data.interviews);
      }
    } catch (error) {
      console.error('Failed to fetch interviews', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  const getIcon = (type) => {
    switch(type) {
      case 'Video': return <Video className="h-5 w-5 text-gray-400" />;
      case 'Phone': return <Phone className="h-5 w-5 text-gray-400" />;
      default: return <MapPin className="h-5 w-5 text-gray-400" />;
    }
  };

  const updateInterview = async (id, payload) => {
    setUpdating(id);
    setError('');
    try {
      const res = await fetch(`/api/interviews/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({}));
        setError(error || 'Could not update interview');
        return false;
      }
      setEditingId(null);
      setEditForm(EMPTY);
      await fetchInterviews();
      return true;
    } catch (err) {
      console.error('Failed to update interview', err);
      return false;
    } finally {
      setUpdating(null);
    }
  };

  const startEdit = (iv) => {
    setEditingId(iv._id);
    setEditForm({
      scheduledDate: iv.scheduledDate ? iv.scheduledDate.slice(0, 16) : '',
      locationOrLink: iv.locationOrLink || '',
      notes: iv.notes || '',
      interviewerName: iv.interviewerName || '',
      interviewType: iv.interviewType || 'Video',
    });
  };

  const badgeClass = (status) => {
    const map = {
      Scheduled: 'hf-badge hf-badge-scheduled',
      Rescheduled: 'hf-badge hf-badge-rescheduled',
      Completed: 'hf-badge hf-badge-completed',
      Cancelled: 'hf-badge hf-badge-cancelled',
    };
    return map[status] || 'hf-badge hf-badge-unknown';
  };

  return (
    <PageTransition key={loading ? 'loading' : 'ready'}>
      <div className="space-y-6 max-w-6xl mx-auto">
        <h1 className="text-h2" style={{ color: 'var(--gray-900)' }}>Interview Schedule</h1>

        {error && (
          <div className="hf-alert hf-alert-error items-center" role="alert">
            <X size={18} className="flex-shrink-0" />
            <span>{error}</span>
            <button onClick={() => setError('')} className="ml-auto hf-btn hf-btn-ghost hf-btn-sm">Dismiss</button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-10" style={{ color: 'var(--color-text-secondary)' }}>Loading interviews...</div>
        ) : interviews.length === 0 ? (
          <div className="hf-empty hf-card">
            <Calendar className="mx-auto h-12 w-12" style={{ color: 'var(--gray-400)' }} />
            <h3 className="text-h4 mt-4" style={{ color: 'var(--gray-900)' }}>No interviews scheduled</h3>
            <p className="text-body mt-2" style={{ color: 'var(--color-text-secondary)' }}>Go to a job's applicant list to schedule interviews.</p>
          </div>
        ) : (
          <div className="hf-card overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {interviews.map((interview) => (
                <li key={interview._id}>
                  <div className="px-5 py-5 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--brand-50)' }}>
                            <User className="h-5 w-5" style={{ color: 'var(--brand-600)' }} />
                          </div>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-h4" style={{ color: 'var(--brand-600)' }}>{interview.candidateId?.name}</h3>
                          <p className="text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>Applying for: {interview.jobId?.title}</p>
                        </div>
                      </div>
                      <span className={badgeClass(interview.status)}>
                        {interview.status}
                      </span>
                    </div>

                    <div className="mt-4 sm:flex sm:justify-between pt-3 border-t border-dashed" style={{ borderColor: 'var(--color-border)' }}>
                      <div className="sm:flex sm:space-x-6 text-body-sm" style={{ color: 'var(--gray-700)' }}>
                        <p className="flex items-center">
                          <Clock className="flex-shrink-0 mr-1.5 h-4 w-4" style={{ color: 'var(--gray-400)' }} />
                          {new Date(interview.scheduledDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                        </p>
                        <p className="mt-2 sm:mt-0 flex items-center">
                          {getIcon(interview.interviewType)}
                          <span className="ml-1.5">{interview.interviewType}</span>
                        </p>
                        {interview.interviewerName && (
                          <p className="mt-2 sm:mt-0 flex items-center">
                            <User className="flex-shrink-0 mr-1.5 h-4 w-4" style={{ color: 'var(--gray-400)' }} />
                            Interviewer: {interview.interviewerName}
                          </p>
                        )}
                      </div>
                      <div className="mt-2 sm:mt-0 flex items-center text-body-sm font-medium break-all" style={{ color: 'var(--brand-600)' }}>
                        <Link2 className="flex-shrink-0 mr-1.5 h-4 w-4" />
                        {interview.locationOrLink}
                      </div>
                    </div>

                    {editingId === interview._id ? (
                      <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="hf-field mb-0">
                          <label className="hf-label">Interview Type</label>
                          <Select
                            value={editForm.interviewType}
                            onChange={(value) => setEditForm((p) => ({ ...p, interviewType: value }))}
                            options={INTERVIEW_TYPE_OPTIONS}
                            ariaLabel="Interview type"
                          />
                        </div>
                        <div className="hf-field mb-0">
                          <label className="hf-label">Date & Time (reschedule)</label>
                          <input
                            type="datetime-local"
                            value={editForm.scheduledDate}
                            onChange={(e) => setEditForm((p) => ({ ...p, scheduledDate: e.target.value }))}
                            className="hf-input"
                          />
                        </div>
                        <div className="hf-field mb-0">
                          <label className="hf-label">Interviewer</label>
                          <input
                            type="text"
                            value={editForm.interviewerName}
                            onChange={(e) => setEditForm((p) => ({ ...p, interviewerName: e.target.value }))}
                            className="hf-input"
                          />
                        </div>
                        <div className="hf-field mb-0">
                          <label className="hf-label">Meeting Link / Location</label>
                          <input
                            type="text"
                            value={editForm.locationOrLink}
                            onChange={(e) => setEditForm((p) => ({ ...p, locationOrLink: e.target.value }))}
                            className="hf-input"
                          />
                        </div>
                        <div className="sm:col-span-2 hf-field mb-0">
                          <label className="hf-label">Notes</label>
                          <textarea
                            rows={2}
                            value={editForm.notes}
                            onChange={(e) => setEditForm((p) => ({ ...p, notes: e.target.value }))}
                            className="hf-textarea"
                          />
                        </div>
                        <div className="sm:col-span-2 flex flex-wrap items-center gap-3 mt-2">
                          <button
                            onClick={() => updateInterview(interview._id, {
                              ...editForm,
                              scheduledDate: editForm.scheduledDate ? new Date(editForm.scheduledDate).toISOString() : undefined,
                            })}
                            disabled={updating === interview._id}
                            className="hf-btn hf-btn-primary"
                          >
                            <RefreshCcw size={15} /> Save Changes
                          </button>
                          <button onClick={() => setEditingId(null)} className="hf-btn hf-btn-ghost">Cancel</button>
                          <div className="ml-auto flex items-center gap-2">
                            <button
                              onClick={() => updateInterview(interview._id, { status: 'Completed' })}
                              disabled={updating === interview._id}
                              className="hf-btn hf-btn-secondary"
                            >
                              <Check size={15} /> Complete
                            </button>
                            <button
                              onClick={() => updateInterview(interview._id, { status: 'Cancelled' })}
                              disabled={updating === interview._id}
                              className="hf-btn hf-btn-ghost text-red-600 hover:text-red-700"
                            >
                              <X size={15} /> Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <button onClick={() => startEdit(interview)} className="hf-btn hf-btn-secondary hf-btn-sm">
                          <RefreshCcw size={14} /> Reschedule
                        </button>
                        <button
                          onClick={() => updateInterview(interview._id, { status: 'Completed' })}
                          disabled={updating === interview._id || interview.status === 'Completed'}
                          className="hf-btn hf-btn-secondary hf-btn-sm"
                        >
                          <Check size={14} /> Mark Complete
                        </button>
                        <button
                          onClick={() => updateInterview(interview._id, { status: 'Cancelled' })}
                          disabled={updating === interview._id || interview.status === 'Cancelled'}
                          className="hf-btn hf-btn-ghost hf-btn-sm text-red-600 hover:text-red-700"
                        >
                          <X size={14} /> Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </PageTransition>
  );
}