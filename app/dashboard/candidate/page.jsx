export const dynamic = 'force-dynamic';

import { getSession } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Application from '@/models/Application';
import Interview from '@/models/Interview';
import CandidateProfile from '@/models/CandidateProfile';
import Link from 'next/link';
import { Briefcase, Calendar, User, ArrowRight, ChevronRight, Search, Sparkles, Hand } from 'lucide-react';
import { getStatusBadgeClass, getMatchScoreClass, getGreeting, timeAgo } from '@/lib/utils';
import { hasMatchScore } from '@/lib/pipeline';
import PageTransition from '@/components/PageTransition';

export default async function CandidateDashboard() {
  const session = await getSession();
  if (!session) return null;

  await connectToDatabase();

  const [applications, upcomingInterviews, profile] = await Promise.all([
    Application.find({ candidateId: session.userId })
      .populate('jobId', 'title location department')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    Interview.find({
      candidateId: session.userId,
      scheduledDate: { $gte: new Date() },
    })
      .populate('jobId', 'title')
      .populate('recruiterId', 'name')
      .sort({ scheduledDate: 1 })
      .limit(3)
      .lean(),
    CandidateProfile.findOne({ userId: session.userId }).lean(),
  ]);

  // Calculate profile completeness
  let profileScore = 0;
  if (profile) {
    if (profile.professionalSummary) profileScore += 20;
    if (profile.skills?.length > 0) profileScore += 20;
    if (profile.experience?.length > 0) profileScore += 25;
    if (profile.cvUrl) profileScore += 25;
    if (profile.location) profileScore += 10;
  }

  const stats = [
    { label: 'Applications', value: applications.length, icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50', href: '/dashboard/candidate/applications' },
    { label: 'Interviews', value: upcomingInterviews.length, icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50', href: '/dashboard/candidate/interviews' },
    { label: 'Profile Score', value: `${profileScore}%`, icon: User, color: 'text-green-600', bg: 'bg-green-50', href: '/dashboard/candidate/profile' },
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h2" style={{ color: 'var(--gray-900)' }}>
              {getGreeting(session.name)}{' '}
              <Hand className="inline h-6 w-6 -mt-1" style={{ color: 'var(--brand-600)' }} />
            </h1>
          <p className="text-body mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            Track your applications and upcoming interviews.
          </p>
        </div>
        <Link href="/jobs" className="hf-btn hf-btn-primary">
          <Search size={16} />
          Browse Jobs
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 hf-stagger">
        {stats.map(({ label, value, icon: Icon, color, bg, href }) => (
          <Link key={label} href={href} className="hf-stat hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-body" style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
              <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center`}>
                <Icon size={16} className={color} />
              </div>
            </div>
            <p className="text-h2 mt-1" style={{ color: 'var(--gray-900)', lineHeight: 1 }}>{value}</p>
          </Link>
        ))}
      </div>

      {/* Profile Prompt if incomplete */}
      {profileScore < 70 && (
        <div className="hf-card px-6 py-4 flex items-center justify-between gap-4" style={{ borderLeft: '3px solid var(--brand-600)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Sparkles size={16} className="text-blue-600" />
            </div>
            <div>
              <p className="text-body font-medium" style={{ color: 'var(--gray-900)' }}>
                Complete your profile — {profileScore}% done
              </p>
              <p className="text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>
                A complete profile gets noticed up to 3x more by recruiters.
              </p>
            </div>
          </div>
          <Link href="/dashboard/candidate/profile" className="hf-btn hf-btn-secondary hf-btn-sm flex-shrink-0">
            Update Profile <ArrowRight size={14} />
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Recent Applications */}
        <div className="lg:col-span-3 hf-card">
          <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <div className="hf-section-header mb-0">
              <h2 className="text-h4" style={{ color: 'var(--gray-900)' }}>Recent Applications</h2>
              <Link href="/dashboard/candidate/applications" transitionTypes={['nav-forward']} className="text-body-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                View all <ChevronRight size={14} />
              </Link>
            </div>
          </div>
          {applications.length === 0 ? (
            <div className="hf-empty">
              <Briefcase size={40} className="text-gray-300 mb-3" />
              <p className="text-body font-medium" style={{ color: 'var(--gray-700)' }}>No applications yet</p>
              <p className="text-body-sm mt-1 mb-4" style={{ color: 'var(--color-text-muted)' }}>Start applying to jobs to track them here.</p>
              <Link href="/jobs" className="hf-btn hf-btn-primary hf-btn-sm">Browse open jobs</Link>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
              {applications.map(app => (
                <div key={app._id} className="px-6 py-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-body font-medium truncate" style={{ color: 'var(--gray-900)' }}>
                      {app.jobId?.title || 'Job unavailable'}
                    </p>
                    <p className="text-caption" style={{ color: 'var(--color-text-muted)' }}>
                      {app.jobId?.location} · {timeAgo(app.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {hasMatchScore(app.matchScore) && (
                      <span className={`text-sm font-semibold ${getMatchScoreClass(app.matchScore)}`}>
                        {app.matchScore}%
                      </span>
                    )}
                    <span className={getStatusBadgeClass(app.status)}>{app.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Interviews */}
        <div className="lg:col-span-2 hf-card">
          <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <div className="hf-section-header mb-0">
              <h2 className="text-h4" style={{ color: 'var(--gray-900)' }}>Upcoming Interviews</h2>
              <Link href="/dashboard/candidate/interviews" transitionTypes={['nav-forward']} className="text-body-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                View all <ChevronRight size={14} />
              </Link>
            </div>
          </div>
          {upcomingInterviews.length === 0 ? (
            <div className="hf-empty" style={{ padding: '32px' }}>
              <Calendar size={32} className="text-gray-300 mb-3" />
              <p className="text-body-sm" style={{ color: 'var(--color-text-muted)' }}>No interviews scheduled</p>
            </div>
          ) : (
            <div className="divide-y px-1" style={{ borderColor: 'var(--color-border)' }}>
              {upcomingInterviews.map(iv => (
                <div key={iv._id} className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                      <Calendar size={16} className="text-purple-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-body font-medium truncate" style={{ color: 'var(--gray-900)' }}>
                        {iv.jobId?.title}
                      </p>
                      <p className="text-caption" style={{ color: 'var(--color-text-secondary)' }}>
                        {new Date(iv.scheduledDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        {' · '}
                        {new Date(iv.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      </div>
    </PageTransition>
  );
}
