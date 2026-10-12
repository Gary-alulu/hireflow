'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Briefcase, MapPin, Users, ChevronRight, Search } from 'lucide-react';
import { getJobStatusClass, timeAgo } from '@/lib/utils';
import PageTransition from '@/components/PageTransition';

function JobCardSkeleton() {
  return (
    <div className="hf-card px-6 py-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="hf-skeleton h-5 w-48 rounded" />
          <div className="hf-skeleton h-4 w-32 rounded" />
        </div>
        <div className="hf-skeleton h-6 w-16 rounded-full" />
      </div>
      <div className="mt-4 flex gap-4">
        <div className="hf-skeleton h-4 w-24 rounded" />
        <div className="hf-skeleton h-4 w-20 rounded" />
      </div>
    </div>
  );
}

export default function JobsListPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    async function fetchJobs() {
      try {
        const res = await fetch('/api/jobs');
        if (res.ok) {
          const data = await res.json();
          setJobs(data.jobs);
        }
      } catch (error) {
        console.error('Failed to fetch jobs', error);
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, []);

  const filtered = filter === 'all' ? jobs : jobs.filter(j => j.status === filter);
  const counts = {
    all: jobs.length,
    active: jobs.filter(j => j.status === 'active').length,
    draft: jobs.filter(j => j.status === 'draft').length,
    paused: jobs.filter(j => j.status === 'paused').length,
    closed: jobs.filter(j => j.status === 'closed').length,
  };

  return (
    <PageTransition key={loading ? 'loading' : 'ready'}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-h2" style={{ color: 'var(--gray-900)' }}>Jobs</h1>
            <p className="text-body mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
              Manage your job postings and track applicants.
            </p>
          </div>
          <Link href="/dashboard/recruiter/jobs/create" className="hf-btn hf-btn-primary">
            <Plus size={16} />
            Post a Job
          </Link>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          {[
            { key: 'all', label: 'All Jobs' },
            { key: 'active', label: 'Active' },
            { key: 'draft', label: 'Drafts' },
            { key: 'paused', label: 'Paused' },
            { key: 'closed', label: 'Closed' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`hf-btn hf-btn-sm ${filter === key ? 'hf-btn-primary' : 'hf-btn-secondary'}`}
            >
              {label}
              <span className={`ml-1 px-1.5 py-0.5 rounded text-xs ${filter === key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                {counts[key]}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-3">
            <JobCardSkeleton />
            <JobCardSkeleton />
            <JobCardSkeleton />
          </div>
        ) : filtered.length === 0 ? (
          <div className="hf-card">
            <div className="hf-empty">
              <Briefcase size={40} className="text-gray-300 mb-3" />
              <p className="text-body font-medium" style={{ color: 'var(--gray-700)' }}>
                {filter === 'all' ? 'No jobs yet' : `No ${filter} jobs`}
              </p>
              <p className="text-body-sm mt-1 mb-4" style={{ color: 'var(--color-text-muted)' }}>
                {filter === 'all' ? 'Create your first job posting to start hiring.' : `You have no jobs with status "${filter}".`}
              </p>
              {filter === 'all' && (
                <Link href="/dashboard/recruiter/jobs/create" className="hf-btn hf-btn-primary hf-btn-sm">
                  <Plus size={14} /> Post a Job
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(job => (
              <Link key={job._id} href={`/dashboard/recruiter/jobs/${job._id}`} transitionTypes={['nav-forward']} className="hf-card block px-6 py-5 hover:shadow-md transition-shadow group">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h2 className="text-body-lg font-semibold truncate group-hover:text-blue-600 transition-colors" style={{ color: 'var(--gray-900)' }}>
                        {job.title}
                      </h2>
                      <span className={getJobStatusClass(job.status)}>
                        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 mt-2">
                      <span className="flex items-center gap-1 text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        <Briefcase size={13} className="flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
                        {job.department}
                      </span>
                      <span className="flex items-center gap-1 text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        <MapPin size={13} className="flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
                        {job.location} · {job.workplaceType}
                      </span>
                      <span className="text-caption" style={{ color: 'var(--color-text-muted)' }}>
                        Posted {timeAgo(job.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 flex-shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className="text-body font-semibold" style={{ color: 'var(--gray-900)' }}>
                        {job.applicationCount || 0}
                      </p>
                      <p className="text-caption" style={{ color: 'var(--color-text-muted)' }}>applicants</p>
                    </div>
                    <ChevronRight size={18} style={{ color: 'var(--color-text-muted)' }} className="group-hover:text-blue-600 transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
