'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Columns3,
  GripVertical,
  Loader2,
  MapPin,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import {
  APPLICATION_STATUSES,
} from '@/lib/pipeline';
import {
  computeYearsOfExperience,
  getMatchScoreBadge,
  latestRole,
  timeAgo,
} from '@/lib/utils';
import MatchBreakdown from '@/components/MatchBreakdown';
import Select from '@/components/ui/Select';

const REJECTED = 'Rejected';

function formatInterviewDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function PipelineBoard({ jobId, jobTitle, jobLocation, jobDepartment }) {
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dragId, setDragId] = useState(null);
  const [overCol, setOverCol] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const load = useCallback(async () => {
    try {
      const [appsRes, ivRes] = await Promise.all([
        fetch(`/api/applications?jobId=${jobId}`),
        fetch('/api/interviews'),
      ]);
      if (!appsRes.ok) throw new Error('Failed to load applications');
      const appsJson = await appsRes.json();
      const ivJson = ivRes.ok ? await ivRes.json() : { interviews: [] };
      setApplications(appsJson.applications || []);
      setInterviews(ivJson.interviews || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    load();
  }, [load]);

  const interviewsByApp = useMemo(() => {
    const map = {};
    for (const iv of interviews) {
      if (!iv || !iv.applicationId) continue;
      const key = String(iv.applicationId);
      if (!map[key]) map[key] = iv;
    }
    return map;
  }, [interviews]);

  const move = useCallback(
    async (appId, newStatus) => {
      if (newStatus === applications.find((a) => a._id === appId)?.status) return;
      setUpdatingId(appId);
      const prev = applications;
      setApplications((apps) =>
        apps.map((a) => (a._id === appId ? { ...a, status: newStatus } : a))
      );
      try {
        const res = await fetch(`/api/applications/${appId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Failed to update stage');
        }
      } catch (err) {
        setError(err.message);
        setApplications(prev);
      } finally {
        setUpdatingId(null);
      }
    },
    [applications]
  );

  const handleDrop = (status) => {
    if (dragId) {
      move(dragId, status);
    }
    setDragId(null);
    setOverCol('');
  };

  const byStatus = (status) => applications.filter((a) => a.status === status);

  const interviewChip = (app) => {
    const iv = interviewsByApp[String(app._id)];
    if (iv) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 border border-emerald-200">
          <Calendar size={11} />
          {iv.interviewType} {formatInterviewDate(iv.scheduledDate)}
        </span>
      );
    }
    if (app.status === 'Interview') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 border border-amber-200">
          Awaiting schedule
        </span>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-500">
        <Loader2 size={22} className="animate-spin mr-2" /> Loading pipeline...
      </div>
    );
  }

  const curIdx = (status) => APPLICATION_STATUSES.indexOf(status);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/recruiter/jobs/${jobId}`}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-h2 font-semibold" style={{ color: 'var(--gray-900)' }}>
              {jobTitle}
            </h1>
            <p className="flex flex-wrap items-center gap-x-3 text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {jobDepartment && <span>{jobDepartment}</span>}
              {jobLocation && (
                <span className="inline-flex items-center gap-1">
                  <MapPin size={13} /> {jobLocation}
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-indigo-600">
                <Sparkles size={13} /> {applications.length} applicant{applications.length === 1 ? '' : 's'}
              </span>
            </p>
          </div>
        </div>
        <Link
          href={`/dashboard/recruiter/jobs/${jobId}/applicants`}
          className="hf-btn hf-btn-secondary"
        >
          <Columns3 size={16} /> List view
        </Link>
      </div>

      {error && (
        <div className="hf-alert hf-alert-error items-center" role="alert">
          <AlertCircle size={18} className="flex-shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto hf-btn hf-btn-ghost hf-btn-sm">
            Dismiss
          </button>
        </div>
      )}

      <div className="flex items-start gap-4 overflow-x-auto pb-4 hide-scrollbar">
        {APPLICATION_STATUSES.map((status) => {
          const apps = byStatus(status);
          const isOver = overCol === status;
          return (
            <div
              key={status}
              className="w-72 flex-shrink-0 flex flex-col rounded-xl border bg-gray-50/70 max-h-[calc(100vh-210px)]"
            >
              <div
                className={`flex items-center justify-between rounded-t-xl border-b px-3 py-2.5 ${status === REJECTED ? 'bg-red-50/60 border-red-100' : isOver ? 'bg-blue-50/80 border-blue-200' : 'bg-white/70 border-gray-200'}`}
              >
                <span className={`text-body-sm font-semibold ${status === REJECTED ? 'text-red-700' : isOver ? 'text-blue-700' : ''}`} style={{ color: status === REJECTED ? undefined : isOver ? undefined : 'var(--gray-800)' }}>
                  {status}
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs hf-pop bg-gray-100 text-gray-600">
                  {apps.length}
                </span>
              </div>

              <div
                className={`flex-1 overflow-y-auto p-2 space-y-2 transition-colors ${isOver ? 'bg-blue-50/60 rounded-b-xl' : ''}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setOverCol(status);
                }}
                onDragLeave={() => setOverCol((c) => (c === status ? '' : c))}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDrop(status);
                }}
              >
                {apps.length === 0 && (
                  <div className="text-xs text-center text-gray-300 py-6 border border-dashed border-gray-200 rounded-lg">
                    Drop candidates here
                  </div>
                )}
                {apps.map((app) => {
                  const name = app.candidateId?.name || app.candidateInfo?.name || 'Candidate';
                  const info = app.candidateInfo || {};
                  const role = latestRole(info.experience);
                  const years = computeYearsOfExperience(info.experience);
                  const iv = interviewsByApp[String(app._id)];
                  const idx = curIdx(app.status);
                  const expanded = expandedId === app._id;
                  return (
                    <div
                      key={app._id}
                      draggable
                      onDragStart={() => setDragId(app._id)}
                      onDragEnd={() => {
                        setDragId(null);
                        setOverCol('');
                      }}
                      className="group bg-white rounded-lg border shadow-sm p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                          {name.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <GripVertical size={13} className="text-gray-300 group-hover:text-gray-400 flex-shrink-0" />
                            <p className="text-body-sm font-semibold truncate" style={{ color: 'var(--gray-900)' }}>
                              {name}
                            </p>
                          </div>
                          {typeof app.matchScore === 'number' && (
                            <button
                              type="button"
                              onClick={() => setExpandedId(expanded ? null : app._id)}
                              className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${getMatchScoreBadge(app.matchScore)}`}
                              title="View AI match analysis"
                            >
                              <Sparkles size={10} />
                              {app.matchScore}% AI Match
                            </button>
                          )}
                        </div>
                      </div>

                      {role && (
                        <p className="text-body-sm mt-2 text-gray-700">{role.title}
                          {years > 0 && <span className="text-gray-400 text-xs"> · {years} yrs</span>}
                        </p>
                      )}
                      <p className="text-xs mt-0.5 text-gray-400 truncate">
                        Applied {timeAgo(app.createdAt)}
                      </p>

                      {iv && (
                        <div className="mt-2">{interviewChip(app)}</div>
                      )}

                      {expanded && (
                        <div className="mt-2 border-t border-gray-100 pt-2">
                          <MatchBreakdown application={app} compact />
                        </div>
                      )}

                      <div className="mt-2.5 flex items-center gap-1">
                        <Select
                          className="flex-1 min-w-0"
                          triggerClassName="bg-gray-50"
                          size="sm"
                          value={app.status}
                          disabled={updatingId === app._id}
                          onChange={(value) => move(app._id, value)}
                          options={APPLICATION_STATUSES.map((s) => ({ value: s, label: s }))}
                          ariaLabel={`Change stage for ${name}`}
                          menuMinWidth={170}
                        />
                        {idx > 0 && (
                          <button
                            type="button"
                            onClick={() => move(app._id, APPLICATION_STATUSES[idx - 1])}
                            className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                            aria-label="Move to previous stage"
                          >
                            <ChevronLeft size={15} />
                          </button>
                        )}
                        {idx < APPLICATION_STATUSES.length - 1 && (
                          <button
                            type="button"
                            onClick={() => move(app._id, APPLICATION_STATUSES[idx + 1])}
                            className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                            aria-label="Move to next stage"
                          >
                            <ChevronRight size={15} />
                          </button>
                        )}
                        {updatingId === app._id && (
                          <Loader2 size={14} className="animate-spin text-blue-600" />
                        )}
                      </div>

                      <Link
                        href={`/dashboard/recruiter/jobs/${jobId}/applicants`}
                        className="mt-2 hidden group-hover:flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        <UserCheck size={12} /> Full review &amp; schedule
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}