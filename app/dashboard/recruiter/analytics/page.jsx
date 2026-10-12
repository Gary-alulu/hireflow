'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  BrainCircuit,
  Send,
  Trophy,
  TrendingUp,
} from 'lucide-react';
import PageTransition from '@/components/PageTransition';

const GROWTH_BAR_COLOR = 'var(--brand-500)';

function KpiCard({ icon: Icon, label, value, suffix, accent = 'var(--brand-600)' }) {
  return (
    <div className="hf-stat relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Icon size={64} style={{ color: accent }} />
      </div>
      <p className="text-label" style={{ color: 'var(--color-text-secondary)' }}>{label}</p>
      <div className="flex items-end gap-1.5">
        <p className="text-display" style={{ color: 'var(--gray-900)' }}>{value}</p>
        {suffix && <p className="text-h4 mb-1" style={{ color: 'var(--color-text-muted)' }}>{suffix}</p>}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch('/api/analytics');
        if (res.ok) {
          setData(await res.json());
        }
      } catch (err) {
        console.error('Failed to fetch analytics', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading || !data) {
    return (
      <PageTransition key={loading ? 'loading' : 'ready'}>
        <div className="max-w-6xl mx-auto space-y-6">
          <h1 className="text-h2" style={{ color: 'var(--gray-900)' }}>Analytics</h1>
          {!loading && !data ? (
            <div className="hf-empty hf-card">
              <p>Failed to load analytics data.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="hf-skeleton h-32 rounded-2xl"></div>
                <div className="hf-skeleton h-32 rounded-2xl"></div>
                <div className="hf-skeleton h-32 rounded-2xl"></div>
              </div>
              <div className="hf-skeleton h-96 rounded-3xl mt-8"></div>
            </>
          )}
        </div>
      </PageTransition>
    );
  }

  const pipelineEntries = Object.entries(data.pipeline || {});
  const maxPipelineCount = Math.max(...pipelineEntries.map(([, count]) => count), 1);
  const growth = data.growth || [];
  const maxGrowth = Math.max(...growth.map((d) => d.count), 1);
  const growthTotal = growth.reduce((sum, d) => sum + d.count, 0);
  const perJob = data.applicationsPerJob || [];

  return (
    <PageTransition key={loading ? 'loading' : 'ready'}>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-h2" style={{ color: 'var(--gray-900)' }}>Analytics</h1>
            <p className="text-body mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              Real-time insights into your recruitment pipeline.
            </p>
          </div>
        </div>

        {/* KPI grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard icon={Briefcase} label="Jobs Published" value={data.publishedJobs} />
          <KpiCard icon={FileText} label="Applications" value={data.totalApplications} />
          <KpiCard icon={Calendar} label="Interviews" value={data.interviews} />
          <KpiCard icon={Send} label="Offers" value={data.offers} />
          <KpiCard icon={Trophy} label="Hires" value={data.hires} accent="#059669" />
          <KpiCard icon={BrainCircuit} label="Avg Match Score" value={data.averageMatchScore} suffix="/ 100" />
          <KpiCard
            icon={Clock}
            label="Time to Hire"
            value={data.timeToHireDays === null || data.timeToHireDays === undefined ? '—' : data.timeToHireDays}
            suffix={data.timeToHireDays === null || data.timeToHireDays === undefined ? '' : 'days'}
            accent="#7c3aed"
          />
          <KpiCard icon={TrendingUp} label="Applications (30d)" value={growthTotal} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Applications per job */}
          <div className="hf-card p-6 md:p-8">
            <div className="flex items-center gap-2 mb-6">
              <FileText className="h-5 w-5" style={{ color: 'var(--brand-600)' }} />
              <h3 className="text-h3" style={{ color: 'var(--gray-900)' }}>Applications per Job</h3>
            </div>
            {perJob.length === 0 ? (
              <p className="text-body" style={{ color: 'var(--color-text-muted)' }}>
                Publish a job to start collecting applications.
              </p>
            ) : (
              <div className="space-y-5">
                {perJob.map((job) => (
                  <div key={job.jobId} className="border-b border-gray-100 pb-5 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <Link
                        href={`/dashboard/recruiter/jobs/${job.jobId}`}
                        className="text-body font-semibold hover:text-blue-600 transition-colors truncate"
                        style={{ color: 'var(--gray-900)' }}
                      >
                        {job.title}
                      </Link>
                      <span className="text-body-sm font-bold flex-shrink-0" style={{ color: 'var(--gray-900)' }}>
                        {job.applications} Applicant{job.applications === 1 ? '' : 's'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-5 gap-y-1 text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      <span>{job.byStage.Screening} Screened</span>
                      <span>{job.byStage.Shortlisted} Shortlisted</span>
                      <span>{job.interviews} Interviews</span>
                      <span>{job.byStage.Offer} Offer{job.byStage.Offer === 1 ? '' : 's'}</span>
                      <span className="font-medium text-emerald-600">{job.byStage.Hired} Hire{job.byStage.Hired === 1 ? '' : 's'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Application growth */}
          <div className="hf-card p-6 md:p-8">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="h-5 w-5" style={{ color: 'var(--brand-600)' }} />
              <h3 className="text-h3" style={{ color: 'var(--gray-900)' }}>Application Growth</h3>
              <span className="ml-auto text-body-sm" style={{ color: 'var(--color-text-muted)' }}>Last 30 days</span>
            </div>
            {growth.length === 0 ? (
              <p className="text-body" style={{ color: 'var(--color-text-muted)' }}>
                No application data yet.
              </p>
            ) : (
              <>
                <div className="flex items-end gap-[3px] h-40">
                  {growth.map((day) => (
                    <div
                      key={day.date}
                      className="flex-1 rounded-t transition-all duration-500 hover:opacity-80"
                      style={{
                        height: `${Math.max((day.count / maxGrowth) * 100, day.count > 0 ? 4 : 1)}%`,
                        backgroundColor: day.count > 0 ? GROWTH_BAR_COLOR : 'var(--gray-100, #e5e7eb)',
                        minWidth: '4px',
                      }}
                      title={`${day.date}: ${day.count} application${day.count === 1 ? '' : 's'}`}
                    ></div>
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-caption" style={{ color: 'var(--color-text-muted)' }}>
                  <span>{growth[0]?.date}</span>
                  <span>{growth[growth.length - 1]?.date}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Pipeline conversion */}
        <div className="hf-card p-6 md:p-8">
          <div className="flex items-center gap-2 mb-8">
            <BarChart3 className="h-5 w-5" style={{ color: 'var(--brand-600)' }} />
            <h3 className="text-h3" style={{ color: 'var(--gray-900)' }}>Candidates per Stage</h3>
          </div>

          <div className="space-y-6">
            {pipelineEntries.map(([stage, count]) => {
              const percentage = Math.round((count / maxPipelineCount) * 100);
              return (
                <div key={stage} className="flex items-center gap-4">
                  <div className="w-32 flex-shrink-0 text-body font-medium" style={{ color: 'var(--gray-700)' }}>
                    {stage}
                  </div>
                  <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden flex items-center relative">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${percentage}%`, backgroundColor: 'var(--brand-500)' }}
                    ></div>
                  </div>
                  <div className="w-12 text-right text-body font-bold" style={{ color: 'var(--gray-900)' }}>
                    {count}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <p className="flex items-center gap-2 text-caption" style={{ color: 'var(--color-text-muted)' }}>
          <CheckCircle2 size={14} />
          Metrics refresh automatically as applications move through your pipeline.
        </p>
      </div>
    </PageTransition>
  );
}