export const dynamic = 'force-dynamic';

import connectToDatabase from '@/lib/db';
import Job from '@/models/Job';
import Company from '@/models/Company';
import Link from 'next/link';
import { Briefcase, MapPin, Clock, LogIn, UserPlus, Calendar } from 'lucide-react';
import { getSession } from '@/lib/auth';
import { parseSalaryMin } from '@/lib/jobs';
import PageTransition from '@/components/PageTransition';
import JobFilterForm from '@/components/JobFilterForm';
import Footer from '@/components/Footer';

export default async function PublicJobBoard({ searchParams }) {
  await connectToDatabase();

  const sp = await searchParams;
  const q = (sp.q || '').trim().toLowerCase();
  const location = (sp.location || '').trim().toLowerCase();
  const workplaceType = sp.workplaceType || '';
  const employmentType = sp.employmentType || '';
  const experienceLevel = sp.experienceLevel || '';
  const salaryMin = Number(sp.salaryMin) || 0;
  const industry = sp.industry || '';
  const posted = sp.posted || '';

  const allJobs = await Job.find({ status: 'active' })
    .populate('companyId', 'name logo industry')
    .sort({ createdAt: -1 })
    .lean();
  const session = await getSession();

  const industryOptions = [...new Set(allJobs.map((j) => j.companyId?.industry).filter(Boolean))].sort();

  const jobs = allJobs.filter((job) => {
    if (q) {
      const haystack = [
        job.title,
        job.location,
        job.department,
        job.companyId?.name || '',
        ...(job.skills || []),
      ].join(' ').toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (location && !(job.location || '').toLowerCase().includes(location)) return false;
    if (workplaceType && job.workplaceType !== workplaceType) return false;
    if (employmentType && job.employmentType !== employmentType) return false;
    if (experienceLevel && job.experienceLevel !== experienceLevel) return false;
    if (industry && job.companyId?.industry !== industry) return false;
    if (salaryMin) {
      const min = parseSalaryMin(job.salaryRange);
      if (!min || min < salaryMin) return false;
    }
    if (posted) {
      const cutoff = Date.now() - Number(posted) * 864e5;
      if (new Date(job.createdAt).getTime() < cutoff) return false;
    }
    return true;
  });

  const activeFilters = Boolean(q || location || workplaceType || employmentType || experienceLevel || salaryMin || industry || posted);

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 flex flex-col hf-in">
      {/* Header */}
      <header className="bg-white border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/images/hireflow-logo.png" alt="HireFlow" className="h-8 w-8 rounded-lg object-contain flex-shrink-0" />
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
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-display mb-4" style={{ color: 'var(--gray-900)' }}>Find your next role</h1>
          <p className="text-body-lg" style={{ color: 'var(--color-text-secondary)' }}>
            Discover and apply to top opportunities perfectly matched to your skills.
          </p>
        </div>

        <JobFilterForm
          defaults={{ q, location, workplaceType, employmentType, experienceLevel, salaryMin: salaryMin ? String(salaryMin) : '', industry, posted }}
          industryOptions={industryOptions}
        />

        <p className="text-body-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
          {jobs.length} {jobs.length === 1 ? 'role' : 'roles'} found
          {activeFilters && ` (filtered from ${allJobs.length})`}
        </p>

        {jobs.length === 0 ? (
          <div className="hf-empty hf-card">
            <Briefcase size={48} className="text-gray-300 mb-4" />
            <h3 className="text-h3" style={{ color: 'var(--gray-900)' }}>
              {allJobs.length === 0 ? 'No open roles right now' : 'No roles match your filters'}
            </h3>
            <p className="text-body mt-2" style={{ color: 'var(--color-text-secondary)' }}>
              {allJobs.length === 0
                ? 'Check back later for new opportunities.'
                : 'Try adjusting your search or clearing some filters.'}
            </p>
            {activeFilters && (
              <Link href="/jobs" className="hf-btn hf-btn-secondary hf-btn-sm mt-4">
                Clear all filters
              </Link>
            )}
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
                    <p className="text-body-sm mt-1 flex items-center gap-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                      <Briefcase size={14} className="flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
                      {job.companyId?.name || 'HireFlow Enterprise'}
                      {job.salaryRange && <span style={{ color: 'var(--color-text-muted)' }}>· {job.salaryRange}</span>}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-4">
                      <span className="flex items-center gap-1.5 text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        <MapPin size={14} className="flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
                        {job.location} ({job.workplaceType})
                      </span>
                      <span className="flex items-center gap-1.5 text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        <Clock size={14} className="flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
                        {job.employmentType}
                      </span>
                      {job.applicationDeadline && (
                        <span className="flex items-center gap-1.5 text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>
                          <Calendar size={14} className="flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
                          Apply by {new Date(job.applicationDeadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
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
      <Footer />
      </div>
    </PageTransition>
  );
}