export const dynamic = 'force-dynamic';

import { getSession } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Job from '@/models/Job';
import Application from '@/models/Application';
import Interview from '@/models/Interview';
import Link from 'next/link';
import { Plus, Briefcase, Users, Calendar, TrendingUp, ArrowRight, ChevronRight, Hand, FileText, Handshake, BadgeCheck, Activity } from 'lucide-react';
import { getStatusBadgeClass, getMatchScoreClass, getGreeting, timeAgo } from '@/lib/utils';
import {
  APPLICATION_STATUSES,
  createEmptyPipelineCounts,
  hasMatchScore,
} from '@/lib/pipeline';
import PageTransition from '@/components/PageTransition';

const PIPELINE_COLUMNS = 4;
const PIPELINE_ROWS = Array.from(
  { length: Math.ceil(APPLICATION_STATUSES.length / PIPELINE_COLUMNS) },
  (_, row) => APPLICATION_STATUSES.slice(row * PIPELINE_COLUMNS, (row + 1) * PIPELINE_COLUMNS)
);

export default async function RecruiterDashboard() {
  const session = await getSession();
  if (!session) return null;

  await connectToDatabase();

const recruiterJobs = await Job.find({ recruiterId: session.userId }).select('_id').lean();
  const jobIds = recruiterJobs.map(j => j._id);

  const [totalJobs, activeJobs, totalApplications, scheduledInterviews, recentApplications, upcomingInterviews, activityCounts] = await Promise.all([
    Job.countDocuments({ recruiterId: session.userId }),
    Job.countDocuments({ recruiterId: session.userId, status: 'active' }),
    Application.countDocuments({ jobId: { $in: jobIds } }),
    Interview.countDocuments({ recruiterId: session.userId, status: 'Scheduled', scheduledDate: { $gte: new Date() } }),
    Application.find({ jobId: { $in: jobIds } })
      .populate('jobId', 'title')
      .populate('candidateId', 'name email')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    Interview.find({ recruiterId: session.userId, scheduledDate: { $gte: new Date() } })
      .populate('candidateId', 'name')
      .populate('jobId', 'title')
      .sort({ scheduledDate: 1 })
      .limit(4)
      .lean(),
    Application.aggregate([
      {
        $match: {
          jobId: { $in: jobIds },
          createdAt: { $gte: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000) },
        },
      },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
    ]),
  ]);

  // Pipeline counts. Every stage in APPLICATION_STATUSES gets a bucket — including
  // stages with nobody in them — so the board renders the full pipeline and its tiles
  // sum to the same total as the "Total Applicants" stat card.
  const pipelineCounts = await Application.aggregate([
    { $match: { jobId: { $in: jobIds } } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  const pipelineMap = createEmptyPipelineCounts();
  pipelineCounts.forEach(({ _id, count }) => {
    if (_id in pipelineMap) pipelineMap[_id] = count;
  });

  const inPipeline = Object.entries(pipelineMap)
    .filter(([status]) => status !== 'Hired' && status !== 'Rejected')
    .reduce((sum, [, count]) => sum + count, 0);

  const dayCounts = {};
  activityCounts.forEach(({ _id, count }) => { dayCounts[_id] = count; });
  const activityDays = [];
  const dayKeys = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayRef = new Date();
  dayRef.setHours(23, 59, 59, 999);
  for (let i = 13; i >= 0; i--) {
    const d = new Date(dayRef);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    activityDays.push({ key, count: dayCounts[key] || 0, label: dayKeys[d.getUTCDay()] });
  }
  const maxActivity = Math.max(...activityDays.map(d => d.count), 1);

  const stats = [
    { label: 'Total Jobs',     value: totalJobs,          icon: Briefcase,  color: 'text-blue-600',     bg: 'bg-blue-50'   },
    { label: 'Active Jobs',    value: activeJobs,         icon: TrendingUp, color: 'text-green-600',    bg: 'bg-green-50'  },
    { label: 'Total Applicants', value: totalApplications, icon: Users,     color: 'text-purple-600',   bg: 'bg-purple-50' },
    { label: 'In Pipeline',    value: inPipeline,         icon: FileText,   color: 'text-cyan-600',     bg: 'bg-cyan-50'   },
    { label: 'Interviews',     value: scheduledInterviews, icon: Calendar, color: 'text-amber-600',    bg: 'bg-amber-50'  },
    { label: 'Offers',         value: pipelineMap['Offer'] || 0, icon: Handshake, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Hires',          value: pipelineMap['Hired'] || 0, icon: BadgeCheck, color: 'text-rose-600',  bg: 'bg-rose-50'  },
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h2" style={{ color: 'var(--gray-900)' }}>
              {getGreeting(session.name)}{' '}
              <Hand className="inline h-6 w-6 -mt-1" style={{ color: 'var(--brand-600)' }} />
            </h1>
          <p className="text-body mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            Here&apos;s what&apos;s happening with your recruitment today.
          </p>
        </div>
        <Link href="/dashboard/recruiter/jobs/create" className="hf-btn hf-btn-primary">
          <Plus size={16} />
          Post a Job
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 hf-stagger">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="hf-stat">
            <div className="flex items-center justify-between">
              <span className="text-body" style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
              <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center`}>
                <Icon size={16} className={color} />
              </div>
            </div>
            <p className="text-h2 mt-1" style={{ color: 'var(--gray-900)', lineHeight: 1 }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Hiring Activity */}
      <div className="hf-card p-6 hf-stagger">
        <div className="flex items-center gap-2 mb-6">
          <Activity className="h-5 w-5" style={{ color: 'var(--brand-600)' }} />
          <h2 className="text-h4" style={{ color: 'var(--gray-900)' }}>Hiring Activity</h2>
          <span className="text-caption ml-auto" style={{ color: 'var(--color-text-muted)' }}>Last 14 days</span>
        </div>
        <div className="flex items-end gap-2 h-40">
          {activityDays.map(day => (
            <div key={day.key} className="flex-1 flex flex-col items-center gap-2 group" title={`${day.key} — ${day.count} application${day.count === 1 ? '' : 's'}`}>
              <div
                className="w-full rounded-md transition-all duration-500 group-hover:opacity-80"
                style={{
                  height: `${Math.max((day.count / maxActivity) * 100, day.count > 0 ? 10 : 3)}%`,
                  minHeight: '3px',
                  backgroundColor: day.count > 0 ? 'var(--brand-500)' : 'var(--color-border)',
                }}
              ></div>
              <span className="text-caption" style={{ color: 'var(--color-text-muted)' }}>{day.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main grid: Pipeline + Interviews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 hf-stagger">
        {/* Hiring Pipeline */}
        <div className="lg:col-span-2 hf-card">
          <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <div className="hf-section-header mb-0">
              <h2 className="text-h4" style={{ color: 'var(--gray-900)' }}>Hiring Pipeline</h2>
              <Link href="/dashboard/recruiter/jobs" transitionTypes={['nav-forward']} className="text-body-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                View all <ChevronRight size={14} />
              </Link>
            </div>
          </div>
          <div className="p-6">
            {PIPELINE_ROWS.map((row, rowIndex) => (
              <div key={rowIndex}>
                {rowIndex > 0 && <hr className="hf-divider my-6" />}
                <div className="grid grid-cols-4 gap-3">
                  {row.map(stage => (
                    <div key={stage} className="text-center">
                      <div className="text-h4" style={{ color: 'var(--gray-900)' }}>
                        {pipelineMap[stage]}
                      </div>
                      <div className={`${getStatusBadgeClass(stage)} mx-auto mt-2`}>
                        {stage}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Interviews */}
        <div className="hf-card">
          <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <h2 className="text-h4" style={{ color: 'var(--gray-900)' }}>Upcoming Interviews</h2>
          </div>
          <div className="divide-y" style={{ '--tw-divide-opacity': 1, borderColor: 'var(--color-border)' }}>
            {upcomingInterviews.length === 0 ? (
              <div className="hf-empty" style={{ padding: '32px' }}>
                <Calendar size={32} className="text-gray-300 mb-3" />
                <p className="text-body-sm" style={{ color: 'var(--color-text-muted)' }}>No upcoming interviews</p>
              </div>
            ) : (
              upcomingInterviews.map(iv => (
                <div key={iv._id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-body font-medium truncate" style={{ color: 'var(--gray-900)' }}>
                        {iv.candidateId?.name}
                      </p>
                      <p className="text-caption truncate" style={{ color: 'var(--color-text-secondary)' }}>
                        {iv.jobId?.title}
                      </p>
                    </div>
                    <div className="text-right ml-4 flex-shrink-0">
                      <p className="text-caption font-medium" style={{ color: 'var(--brand-600)' }}>
                        {new Date(iv.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                      <p className="text-caption" style={{ color: 'var(--color-text-muted)' }}>
                        {new Date(iv.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          {upcomingInterviews.length > 0 && (
            <div className="px-6 py-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <Link href="/dashboard/recruiter/interviews" transitionTypes={['nav-forward']} className="text-body-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                View all interviews <ArrowRight size={13} />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Recent Applications */}
      <div className="hf-card">
        <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div className="hf-section-header mb-0">
            <h2 className="text-h4" style={{ color: 'var(--gray-900)' }}>Recent Applications</h2>
            <Link href="/dashboard/recruiter/jobs" transitionTypes={['nav-forward']} className="text-body-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View jobs <ChevronRight size={14} />
            </Link>
          </div>
        </div>
        {recentApplications.length === 0 ? (
          <div className="hf-empty">
            <Users size={40} className="text-gray-300 mb-3" />
            <p className="text-body font-medium" style={{ color: 'var(--gray-700)' }}>No applications yet</p>
            <p className="text-body-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Applications will appear here once candidates apply</p>
            <Link href="/dashboard/recruiter/jobs/create" className="hf-btn hf-btn-primary hf-btn-sm mt-4">
              Post your first job
            </Link>
          </div>
        ) : (
          <table className="hf-table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Position</th>
                <th>Match</th>
                <th>Stage</th>
                <th>Applied</th>
              </tr>
            </thead>
            <tbody>
              {recentApplications.map(app => (
                <tr key={app._id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-xs font-semibold text-blue-700">
                        {app.candidateId?.name?.[0] || '?'}
                      </div>
                      <div>
                        <p className="font-medium" style={{ color: 'var(--gray-900)' }}>{app.candidateId?.name}</p>
                        <p className="text-caption" style={{ color: 'var(--color-text-muted)' }}>{app.candidateId?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: 'var(--color-text-secondary)' }}>{app.jobId?.title}</td>
                  <td>
                    {hasMatchScore(app.matchScore) ? (
                      <span className={`font-semibold text-sm ${getMatchScoreClass(app.matchScore)}`}>
                        {app.matchScore}%
                      </span>
                    ) : (
                      <span className="text-caption" style={{ color: 'var(--color-text-muted)' }}>—</span>
                    )}
                  </td>
                  <td><span className={getStatusBadgeClass(app.status)}>{app.status}</span></td>
                  <td style={{ color: 'var(--color-text-muted)' }}>{timeAgo(app.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      </div>
    </PageTransition>
  );
}
