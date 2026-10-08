'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit2, Users, Briefcase, MapPin, Clock, DollarSign, Building } from 'lucide-react';
import { getJobStatusClass, timeAgo } from '@/lib/utils';
import PageTransition from '@/components/PageTransition';

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

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
              </div>
            </div>
            
            <div className="flex items-center gap-3 flex-shrink-0">
              <button className="hf-btn hf-btn-secondary">
                <Edit2 size={16} />
                Edit Job
              </button>
              <Link href={`/dashboard/recruiter/jobs/${job._id}/applicants`} className="hf-btn hf-btn-primary">
                <Users size={16} />
                View Applicants
              </Link>
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
