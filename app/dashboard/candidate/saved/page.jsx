'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bookmark, Briefcase, MapPin, Clock, Calendar, ArrowUpRight } from 'lucide-react';
import PageTransition from '@/components/PageTransition';

function SkeletonRow() {
  return (
    <div className="hf-card px-6 py-5">
      <div className="hf-skeleton h-5 w-48 rounded" />
      <div className="hf-skeleton h-4 w-32 rounded mt-3" />
    </div>
  );
}

export default function SavedJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSaved() {
      try {
        const res = await fetch('/api/saved-jobs');
        if (res.ok) {
          const data = await res.json();
          setJobs(data.jobs);
        }
      } catch (error) {
        console.error('Failed to fetch saved jobs', error);
      } finally {
        setLoading(false);
      }
    }
    fetchSaved();
  }, []);

  const unsave = async (jobId) => {
    const res = await fetch(`/api/saved-jobs?jobId=${jobId}`, { method: 'DELETE' });
    if (res.ok) {
      setJobs((prev) => prev.filter((j) => j._id !== jobId));
    }
  };

  return (
    <PageTransition key={loading ? 'loading' : 'ready'}>
      <div className="space-y-6">
        <div>
          <h1 className="text-h2" style={{ color: 'var(--gray-900)' }}>Saved Jobs</h1>
          <p className="text-body mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            Roles you bookmarked to review later.
          </p>
        </div>

        {loading ? (
          <div className="space-y-3">
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </div>
        ) : jobs.length === 0 ? (
          <div className="hf-card">
            <div className="hf-empty">
              <Bookmark size={40} className="text-gray-300 mb-3" />
              <p className="text-body font-medium" style={{ color: 'var(--gray-700)' }}>No saved jobs yet</p>
              <p className="text-body-sm mt-1 mb-4" style={{ color: 'var(--color-text-muted)' }}>
                Bookmark roles from the job board and they will show up here.
              </p>
              <Link href="/jobs" className="hf-btn hf-btn-primary hf-btn-sm">
                Browse open jobs
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <div key={job._id} className="hf-card px-6 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/jobs/${job._id}`}
                        transitionTypes={['nav-forward']}
                        className="text-body-lg font-semibold truncate hover:text-blue-600 transition-colors"
                        style={{ color: 'var(--gray-900)' }}
                      >
                        {job.title}
                      </Link>
                      <ArrowUpRight size={15} style={{ color: 'var(--color-text-muted)' }} className="flex-shrink-0" />
                    </div>
                    <p className="text-body-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                      {job.companyId?.name || 'HireFlow Enterprise'}
                      {job.salaryRange && <span style={{ color: 'var(--color-text-muted)' }}> · {job.salaryRange}</span>}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 mt-2">
                      <span className="flex items-center gap-1 text-caption" style={{ color: 'var(--color-text-secondary)' }}>
                        <MapPin size={13} style={{ color: 'var(--color-text-muted)' }} />
                        {job.location} ({job.workplaceType})
                      </span>
                      <span className="flex items-center gap-1 text-caption" style={{ color: 'var(--color-text-secondary)' }}>
                        <Clock size={13} style={{ color: 'var(--color-text-muted)' }} />
                        {job.employmentType}
                      </span>
                      {job.applicationDeadline && (
                        <span className="flex items-center gap-1 text-caption" style={{ color: 'var(--color-text-secondary)' }}>
                          <Calendar size={13} style={{ color: 'var(--color-text-muted)' }} />
                          Apply by {new Date(job.applicationDeadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link href={`/jobs/${job._id}`} className="hf-btn hf-btn-secondary hf-btn-sm">
                      <Briefcase size={14} /> View
                    </Link>
                    <button
                      type="button"
                      onClick={() => unsave(job._id)}
                      className="hf-btn hf-btn-ghost hf-btn-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}