export const dynamic = 'force-dynamic';

import connectToDatabase from '@/lib/db';
import Job from '@/models/Job';
import Link from 'next/link';
import { Briefcase, MapPin, Clock, Search, LogIn, UserPlus } from 'lucide-react';
import { getSession } from '@/lib/auth';
import PageTransition from '@/components/PageTransition';

export default async function PublicJobBoard() {
  await connectToDatabase();
  
  // Only fetch active jobs
  const jobs = await Job.find({ status: 'active' }).sort({ createdAt: -1 });
  const session = await getSession();

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 flex flex-col hf-in">
      {/* Header */}
      <header className="bg-white border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                <path d="M3 4h10M3 8h7M3 12h5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="font-bold text-xl tracking-tight" style={{ color: 'var(--gray-900)' }}>HireFlow</span>
          </Link>
          <div className="flex items-center gap-4">
            {session ? (
              <Link href={`/dashboard/${session.role}`} className="hf-btn hf-btn-secondary">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="hf-btn hf-btn-ghost">
                  <LogIn size={16} /> Sign In
                </Link>
                <Link href="/register" className="hf-btn hf-btn-primary">
                  <UserPlus size={16} /> Register
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-display mb-4" style={{ color: 'var(--gray-900)' }}>Find your next role</h1>
          <p className="text-body-lg" style={{ color: 'var(--color-text-secondary)' }}>
            Discover and apply to top opportunities perfectly matched to your skills.
          </p>
        </div>

        <div className="mb-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="hf-input pl-11 py-6 text-base"
              style={{ height: '60px', borderRadius: '12px' }}
              placeholder="Search jobs by title, skill, or company..."
            />
          </div>
        </div>

        {jobs.length === 0 ? (
          <div className="hf-empty hf-card">
            <Briefcase size={48} className="text-gray-300 mb-4" />
            <h3 className="text-h3" style={{ color: 'var(--gray-900)' }}>No open roles right now</h3>
            <p className="text-body mt-2" style={{ color: 'var(--color-text-secondary)' }}>
              Check back later for new opportunities.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <Link key={job._id.toString()} href={`/jobs/${job._id.toString()}`} className="hf-card block px-6 py-6 hover:border-blue-500 hover:shadow-md transition-all group">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-h3 truncate group-hover:text-blue-600 transition-colors" style={{ color: 'var(--gray-900)' }}>
                      {job.title}
                    </h2>
                    <div className="mt-3 flex flex-wrap gap-4">
                      <span className="flex items-center gap-1.5 text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        <Briefcase size={14} className="flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
                        {job.department}
                      </span>
                      <span className="flex items-center gap-1.5 text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        <MapPin size={14} className="flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
                        {job.location} ({job.workplaceType})
                      </span>
                      <span className="flex items-center gap-1.5 text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        <Clock size={14} className="flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
                        {job.employmentType}
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 mt-2 sm:mt-0">
                    <span className="hf-btn hf-btn-secondary">
                      View Role
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      </div>
    </PageTransition>
  );
}
