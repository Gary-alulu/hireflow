'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, Clock, Briefcase, CheckCircle2, MessageSquareText } from 'lucide-react';
import { getStatusBadgeClass, getMatchScoreBadge } from '@/lib/utils';
import { hasMatchScore } from '@/lib/pipeline';
import PageTransition from '@/components/PageTransition';
import MessageThread from '@/components/MessageThread';

const PIPELINE = ['Applied', 'Screening', 'Shortlisted', 'Interview', 'Assessment', 'Offer', 'Hired'];

function PipelineStepper({ status }) {
  if (status === 'Rejected') {
    return (
      <div className="mt-4 flex items-center gap-2">
        <div className="h-3 w-3 rounded-full bg-red-500 flex-shrink-0"></div>
        <span className="text-caption font-medium" style={{ color: 'var(--red-600, #dc2626)' }}>Application closed · Rejected</span>
      </div>
    );
  }

  const currentIdx = PIPELINE.indexOf(status);
  if (currentIdx === -1) return null;

  return (
    <div className="mt-4 overflow-x-auto pb-1">
      <div className="flex items-center w-max" aria-label={`Application status: ${status}`}>
        {PIPELINE.map((stage, i) => {
          const done = i <= currentIdx;
          const isCurrent = i === currentIdx;
          return (
            <div key={stage} className="flex items-center">
              <div className="flex flex-col items-center w-20">
                <div
                  className={`h-3.5 w-3.5 rounded-full border-2 flex items-center justify-center ${
                    done ? 'border-blue-600' : 'border-gray-300 bg-white'
                  }`}
                  style={done ? { background: 'var(--brand-600)' } : undefined}
                >
                  {isCurrent && currentIdx === PIPELINE.length - 1 && (
                    <CheckCircle2 size={10} className="text-white" />
                  )}
                </div>
                <span
                  className={`mt-1 text-[10px] font-medium text-center leading-tight ${
                    isCurrent ? 'text-blue-700' : done ? 'text-gray-600' : 'text-gray-400'
                  }`}
                >
                  {stage}
                </span>
              </div>
              {i < PIPELINE.length - 1 && (
                <div className={`h-0.5 w-6 -mt-4 ${i < currentIdx ? 'bg-blue-600' : 'bg-gray-200'}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function CandidateApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionUserId, setSessionUserId] = useState(null);
  const [openChat, setOpenChat] = useState(null);

  useEffect(() => {
    fetch('/api/auth/session')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data?.user?.userId && setSessionUserId(data.user.userId))
      .catch(() => {});
  }, []);

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
                        <div className="flex items-center gap-2">
                          <Link href={`/jobs/${app.jobId?._id}`} className="text-h4 truncate hover:text-blue-700 transition-colors" style={{ color: 'var(--brand-600)' }}>
                            {app.jobId?.title || 'Job no longer available'}
                          </Link>
                        </div>
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
                    <PipelineStepper status={app.status} />
                    <div className="mt-4 flex items-center justify-end">
                      <button
                        onClick={() => setOpenChat(openChat === app._id ? null : app._id)}
                        className={`hf-btn hf-btn-sm ${openChat === app._id ? 'hf-btn-primary' : 'hf-btn-secondary'}`}
                      >
                        <MessageSquareText size={14} />
                        {openChat === app._id ? 'Close chat' : 'Message recruiter'}
                      </button>
                    </div>
                    {openChat === app._id && (
                      <div className="mt-4 bg-gray-50 rounded-xl border border-gray-200 p-4">
                        <MessageThread applicationId={app._id} currentUserId={sessionUserId} />
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
