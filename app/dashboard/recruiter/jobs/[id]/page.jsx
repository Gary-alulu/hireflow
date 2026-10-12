'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit2, Users, Briefcase, MapPin, Clock, Building, Copy, Trash2, Loader2, Calendar, Gift, Kanban } from 'lucide-react';
import { getJobStatusClass, timeAgo } from '@/lib/utils';
import { JOB_STATUS_TRANSITIONS } from '@/lib/jobs';
import PageTransition from '@/components/PageTransition';

function actionLabel(from, to) {
  if (to === 'active') return from === 'draft' ? 'Publish Job' : 'Reopen Job';
  if (to === 'paused') return 'Pause Job';
  if (to === 'closed') return 'Close Job';
  return to;
}

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    async function fetchJob() {
      try {
        const res = await fetch(`/api/jobs/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setJob(data.job);
        }
      } catch (error) {
        console.error('Failed to fetch job', error);
      } finally {
        setLoading(false);
      }
    }
    if (params.id) {
      fetchJob();
    }
  }, [params.id]);

  const changeStatus = async (to) => {
    setWorking(true);
    setActionError('');
    try {
      const res = await fetch(`/api/jobs/${job._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: to }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update status');
      setJob(data.job);
      router.refresh();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setWorking(false);
    }
  };

  const duplicateJob = async () => {
    setWorking(true);
    setActionError('');
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: job.title,
          department: job.department,
          employmentType: job.employmentType,
          location: job.location,
          workplaceType: job.workplaceType,
          salaryRange: job.salaryRange || '',
          description: job.description,
          responsibilities: (job.responsibilities || []).join('\n'),
          requirements: (job.requirements || []).join('\n'),
          benefits: (job.benefits || []).join('\n'),
          skills: (job.skills || []).join(', '),
          experienceLevel: job.experienceLevel,
          applicationDeadline: job.applicationDeadline ? new Date(job.applicationDeadline).toISOString().slice(0, 10) : '',
          status: 'draft',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to duplicate job');
      router.push(`/dashboard/recruiter/jobs/${data.job._id}/edit`);
      router.refresh();
    } catch (err) {
      setActionError(err.message);
      setWorking(false);
    }
  };

  const deleteJob = async () => {
    if (!window.confirm(`Delete "${job.title}" and all applications for it? This cannot be undone.`)) {
      return;
    }
    setWorking(true);
    setActionError('');
    try {
      const res = await fetch(`/api/jobs/${job._id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete job');
      router.push('/dashboard/recruiter/jobs');
      router.refresh();
    } catch (err) {
      setActionError(err.message);
      setWorking(false);
    }
  };

  if (loading) {
    return (
      <PageTransition key={loading ? 'loading' : 'ready'}>
        <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
          <div className="hf-skeleton h-32 w-full rounded-xl"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div className="hf-skeleton h-64 w-full rounded-xl"></div>
              <div className="hf-skeleton h-48 w-full rounded-xl"></div>
            </div>
            <div className="hf-skeleton h-80 w-full rounded-xl"></div>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (!job) {
    return (
      <PageTransition key={loading ? 'loading' : 'ready'}>
        <div className="hf-empty hf-card">
          <Briefcase size={40} className="text-gray-300 mb-3" />
          <p className="text-body font-medium" style={{ color: 'var(--error-600)' }}>Job not found</p>
          <Link href="/dashboard/recruiter/jobs" className="hf-btn hf-btn-secondary hf-btn-sm mt-4">
            Return to Jobs
          </Link>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition key={loading ? 'loading' : 'ready'}>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Navigation */}
        <Link href="/dashboard/recruiter/jobs" transitionTypes={['nav-back']} className="inline-flex items-center gap-2 text-body-sm font-medium hover:text-blue-600 transition-colors" style={{ color: 'var(--color-text-secondary)' }}>
          <ArrowLeft size={16} />
          Back to Jobs
        </Link>

        {/* Hero Card */}
        <div className="hf-card p-6 md:p-8">
          {actionError && (
            <div className="hf-alert hf-alert-error mb-4">{actionError}</div>
          )}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-h1" style={{ color: 'var(--gray-900)' }}>{job.title}</h1>
                <span className={getJobStatusClass(job.status)}>
                  {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                </span>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 mt-4">
                <div className="flex items-center gap-1.5 text-body" style={{ color: 'var(--color-text-secondary)' }}>
                  <Building size={16} style={{ color: 'var(--color-text-muted)' }} />
                  {job.department}
                </div>
                <div className="flex items-center gap-1.5 text-body" style={{ color: 'var(--color-text-secondary)' }}>
                  <MapPin size={16} style={{ color: 'var(--color-text-muted)' }} />
                  {job.location} ({job.workplaceType})
                </div>
                <div className="flex items-center gap-1.5 text-body" style={{ color: 'var(--color-text-secondary)' }}>
                  <Clock size={16} style={{ color: 'var(--color-text-muted)' }} />
                  Posted {timeAgo(job.createdAt)}
                </div>
                {job.applicationDeadline && (
                  <div className="flex items-center gap-1.5 text-body" style={{ color: 'var(--color-text-secondary)' }}>
                    <Calendar size={16} style={{ color: 'var(--color-text-muted)' }} />
                    Apply by {new Date(job.applicationDeadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col items-start md:items-end gap-4 flex-shrink-0">
              <div className="flex flex-wrap items-center gap-3">
                <Link href={`/dashboard/recruiter/jobs/${job._id}/edit`} className="hf-btn hf-btn-secondary">
                  <Edit2 size={16} />
                  Edit Job
                </Link>
                <button type="button" onClick={duplicateJob} disabled={working} className="hf-btn hf-btn-secondary">
                  {working ? <Loader2 size={16} className="animate-spin" /> : <Copy size={16} />}
                  Duplicate
                </button>
                <button type="button" onClick={deleteJob} disabled={working} className="hf-btn hf-btn-ghost text-red-600 hover:text-red-700">
                  <Trash2 size={16} />
                  Delete
                </button>
                <Link href={`/dashboard/recruiter/jobs/${job._id}/applicants`} className="hf-btn hf-btn-primary">
                  <Users size={16} />
                  View Applicants
                </Link>
                <Link href={`/dashboard/recruiter/jobs/${job._id}/pipeline`} className="hf-btn hf-btn-secondary">
                  <Kanban size={16} />
                  Pipeline
                </Link>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {(JOB_STATUS_TRANSITIONS[job.status] || []).map((to) => (
                  <button
                    key={to}
                    type="button"
                    onClick={() => changeStatus(to)}
                    disabled={working}
                    className={`hf-btn ${to === 'active' ? 'hf-btn-primary' : 'hf-btn-secondary'}`}
                  >
                    {working && <Loader2 size={16} className="animate-spin" />}
                    {actionLabel(job.status, to)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            <div className="hf-card p-6 md:p-8">
              <h3 className="text-h3 mb-4" style={{ color: 'var(--gray-900)' }}>About this role</h3>
              <div className="text-body whitespace-pre-wrap" style={{ color: 'var(--gray-700)' }}>
                {job.description}
              </div>
              
              <hr className="hf-divider my-8" />

              <h3 className="text-h3 mb-4" style={{ color: 'var(--gray-900)' }}>Key Responsibilities</h3>
              <ul className="space-y-3">
                {job.responsibilities?.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-body" style={{ color: 'var(--gray-700)' }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <hr className="hf-divider my-8" />

              <h3 className="text-h3 mb-4" style={{ color: 'var(--gray-900)' }}>Requirements</h3>
              <ul className="space-y-3">
                {job.requirements?.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-body" style={{ color: 'var(--gray-700)' }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              {job.benefits?.length > 0 && (
                <>
                  <hr className="hf-divider my-8" />

                  <h3 className="text-h3 mb-4" style={{ color: 'var(--gray-900)' }}>Benefits</h3>
                  <ul className="space-y-3">
                    {job.benefits.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-body" style={{ color: 'var(--gray-700)' }}>
                        <Gift size={14} style={{ color: 'var(--brand-600)' }} className="mt-1 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {job.questions?.length > 0 && (
                <>
                  <hr className="hf-divider my-8" />

                  <h3 className="text-h3 mb-4" style={{ color: 'var(--gray-900)' }}>Application Questions</h3>
                  <ol className="space-y-3">
                    {job.questions.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-body" style={{ color: 'var(--gray-700)' }}>
                        <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0" style={{ color: 'var(--brand-600)', background: 'var(--brand-50, #eff6ff)' }}>{i + 1}</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ol>
                </>
              )}
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <div className="hf-card p-6">
              <h3 className="text-h4 mb-4" style={{ color: 'var(--gray-900)' }}>Job Overview</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-caption" style={{ color: 'var(--color-text-muted)' }}>Experience Level</p>
                  <p className="text-body font-medium mt-1" style={{ color: 'var(--gray-900)' }}>{job.experienceLevel}</p>
                </div>
                <div>
                  <p className="text-caption" style={{ color: 'var(--color-text-muted)' }}>Employment Type</p>
                  <p className="text-body font-medium mt-1" style={{ color: 'var(--gray-900)' }}>{job.employmentType}</p>
                </div>
                <div>
                  <p className="text-caption" style={{ color: 'var(--color-text-muted)' }}>Workplace</p>
                  <p className="text-body font-medium mt-1" style={{ color: 'var(--gray-900)' }}>
                    {job.workplaceType.charAt(0).toUpperCase() + job.workplaceType.slice(1)}
                  </p>
                </div>
                {job.salaryRange && (
                  <div>
                    <p className="text-caption" style={{ color: 'var(--color-text-muted)' }}>Salary Range</p>
                    <p className="text-body font-medium mt-1 flex items-center gap-1" style={{ color: 'var(--gray-900)' }}>
                      {job.salaryRange}
                    </p>
                  </div>
                )}
                {job.applicationDeadline && (
                  <div>
                    <p className="text-caption" style={{ color: 'var(--color-text-muted)' }}>Application Deadline</p>
                    <p className="text-body font-medium mt-1" style={{ color: 'var(--gray-900)' }}>
                      {new Date(job.applicationDeadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="hf-card p-6">
              <h3 className="text-h4 mb-3" style={{ color: 'var(--gray-900)' }}>Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills?.map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 text-body-sm font-medium rounded-md border border-gray-200">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
