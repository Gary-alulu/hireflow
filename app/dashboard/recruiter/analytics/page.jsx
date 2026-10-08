'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Briefcase, FileText, BrainCircuit } from 'lucide-react';
import PageTransition from '@/components/PageTransition';

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

  if (loading) {
    return (
      <PageTransition key={loading ? 'loading' : 'ready'}>
        <div className="max-w-6xl mx-auto space-y-6">
          <h1 className="text-h2" style={{ color: 'var(--gray-900)' }}>Analytics Dashboard</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="hf-skeleton h-32 rounded-2xl"></div>
            <div className="hf-skeleton h-32 rounded-2xl"></div>
            <div className="hf-skeleton h-32 rounded-2xl"></div>
          </div>
          <div className="hf-skeleton h-96 rounded-3xl mt-8"></div>
        </div>
      </PageTransition>
    );
  }

  if (!data) {
    return (
      <PageTransition key={loading ? 'loading' : 'ready'}>
        <div className="max-w-6xl mx-auto space-y-6">
          <h1 className="text-h2" style={{ color: 'var(--gray-900)' }}>Analytics Dashboard</h1>
          <div className="hf-empty hf-card">
            <p>Failed to load analytics data.</p>
          </div>
        </div>
      </PageTransition>
    );
  }

  // Calculate max pipeline value for the bar chart
  const pipelineEntries = Object.entries(data.pipeline);
  const maxPipelineCount = Math.max(...pipelineEntries.map(([_, count]) => count), 1);

  return (
    <PageTransition key={loading ? 'loading' : 'ready'}>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-h2" style={{ color: 'var(--gray-900)' }}>Analytics Dashboard</h1>
            <p className="text-body mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              Real-time insights into your recruitment pipeline.
            </p>
          </div>
        </div>
      
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="hf-stat relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Briefcase size={64} style={{ color: 'var(--brand-600)' }} />
            </div>
            <p className="text-label" style={{ color: 'var(--color-text-secondary)' }}>Total Jobs Posted</p>
            <p className="text-display" style={{ color: 'var(--gray-900)' }}>{data.totalJobs}</p>
          </div>
        
          <div className="hf-stat relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <FileText size={64} style={{ color: 'var(--brand-600)' }} />
            </div>
            <p className="text-label" style={{ color: 'var(--color-text-secondary)' }}>Total Applications</p>
            <p className="text-display" style={{ color: 'var(--gray-900)' }}>{data.totalApplications}</p>
          </div>
        
          <div className="hf-stat relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <BrainCircuit size={64} style={{ color: 'var(--brand-600)' }} />
            </div>
            <p className="text-label" style={{ color: 'var(--color-text-secondary)' }}>Avg Match Score</p>
            <div className="flex items-end gap-2">
              <p className="text-display" style={{ color: 'var(--gray-900)' }}>{data.averageMatchScore}</p>
              <p className="text-h4 mb-1" style={{ color: 'var(--color-text-muted)' }}>/ 100</p>
            </div>
          </div>
        </div>

        {/* Pipeline Chart */}
        <div className="hf-card p-6 md:p-8">
          <div className="flex items-center gap-2 mb-8">
            <BarChart3 className="h-5 w-5" style={{ color: 'var(--brand-600)' }} />
            <h3 className="text-h3" style={{ color: 'var(--gray-900)' }}>Hiring Pipeline Conversion</h3>
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
      </div>
    </PageTransition>
  );
}

