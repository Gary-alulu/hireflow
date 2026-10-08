'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, Clock, Briefcase } from 'lucide-react';
import { getStatusBadgeClass, getMatchScoreBadge } from '@/lib/utils';
import { hasMatchScore } from '@/lib/pipeline';
import PageTransition from '@/components/PageTransition';

export default function CandidateApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchApplications() {
      try {
        const res = await fetch('/api/applications');
        if (!res.ok) {
          setError(
            res.status === 401
              ? 'Your session has expired. Please sign in again.'
              : 'Could not load your applications.'
          );
          return;
        }
        const data = await res.json();
        setApplications(data.applications);
      } catch (error) {
        console.error('Failed to fetch applications', error);
        setError('Could not load your applications.');
      } finally {
        setLoading(false);
      }
    }
    fetchApplications();
  }, []);

  return (
    <PageTransition key={loading ? 'loading' : 'ready'}>
      <div className="space-y-6 max-w-5xl mx-auto">
        <h1 className="text-h2" style={{ color: 'var(--gray-900)' }}>My Applications</h1>

        {error ? (
          <div className="hf-alert hf-alert-error items-center" role="alert">
            <FileText size={18} className="flex-shrink-0" />
            <span>{error}</span>
            <Link href="/dashboard/candidate" transitionTypes={['nav-back']} className="ml-auto hf-btn hf-btn-ghost hf-btn-sm">
              Back to dashboard
            </Link>
          </div>
        ) : loading ? (
          <div className="text-center py-10" style={{ color: 'var(--color-text-secondary)' }}>Loading applications...</div>
        ) : applications.length === 0 ? (
          <div className="hf-empty hf-card">
            <FileText className="mx-auto h-12 w-12" style={{ color: 'var(--gray-400)' }} />
            <h3 className="text-h4 mt-4" style={{ color: 'var(--gray-900)' }}>No applications yet</h3>
            <p className="text-body mt-2" style={{ color: 'var(--color-text-secondary)' }}>Start by browsing open jobs and applying.</p>
            <div className="mt-6">
              <Link href="/jobs" className="hf-btn hf-btn-primary">
                Browse Jobs
              </Link>
            </div>
          </div>
        ) : (
          <div className="hf-card">
            <ul className="divide-y divide-gray-200">
              {applications.map((app) => (
                <li key={app._id} className="hover:bg-gray-50 transition-colors">
                  <div className="px-5 py-5 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h2 className="text-h4 truncate" style={{ color: 'var(--brand-600)' }}>
                          {app.jobId?.title || 'Job no longer available'}
                        </h2>
                        <div className="mt-2 flex items-center gap-4 text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>
                          <span className="flex items-center">
                            <Briefcase className="h-4 w-4 mr-1.5" />
                            {app.jobId?.department}
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1.5" />
                            Applied {new Date(app.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0 flex gap-3 items-center">
                        {hasMatchScore(app.matchScore) && (
                          <span className={getMatchScoreBadge(app.matchScore)}>
                            {app.matchScore}% Match
                          </span>
                        )}
                        <span className={getStatusBadgeClass(app.status)}>
                          {app.status}
                        </span>
                      </div>
                    </div>
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
