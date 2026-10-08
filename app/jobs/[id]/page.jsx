export const dynamic = 'force-dynamic';

import connectToDatabase from '@/lib/db';
import Job from '@/models/Job';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Briefcase, MapPin, Clock, DollarSign, ChevronLeft, Building, Share2 } from 'lucide-react';
import { getSession } from '@/lib/auth';
import ApplyButton from '@/components/ApplyButton';
import Application from '@/models/Application';
import { timeAgo } from '@/lib/utils';
import PageTransition from '@/components/PageTransition';

export default async function PublicJobDetailsPage({ params }) {
  await connectToDatabase();
  const { id } = params;
  const job = await Job.findOne({ _id: id, status: 'active' }).populate('companyId', 'name logo');
  
  if (!job) notFound();

  const session = await getSession();
  let hasApplied = false;

  if (session && session.role === 'candidate') {
    const existingApplication = await Application.findOne({
      jobId: id,
      candidateId: session.userId,
    });
    hasApplied = !!existingApplication;
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 flex flex-col pb-12 hf-in">
      {/* Header */}
      <header className="bg-white border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <Link href="/jobs" transitionTypes={['nav-back']} className="flex items-center gap-2 text-sm font-medium hover:text-blue-600 transition-colors" style={{ color: 'var(--color-text-secondary)' }}>
            <ChevronLeft size={16} /> Back to Jobs
          </Link>
          <Link href="/" className="flex items-center gap-2">
             <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center flex-shrink-0">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <path d="M3 4h10M3 8h7M3 12h5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="font-bold tracking-tight" style={{ color: 'var(--gray-900)' }}>HireFlow</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full mt-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Card */}
            <div className="hf-card p-6 md:p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-h1 mb-2" style={{ color: 'var(--gray-900)' }}>{job.title}</h1>
                  <p className="text-body-lg flex items-center gap-2" style={{ color: 'var(--color-text-secondary)' }}>
                    <Building size={18} />
                    {job.companyId?.name || 'HireFlow Enterprise'}
                  </p>
                </div>
                <div className="hidden sm:block">
                  <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center border border-gray-200">
                    <Building size={24} className="text-gray-400" />
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-100">
                <span className="flex items-center gap-1.5 text-body-sm bg-gray-50 px-3 py-1.5 rounded-md" style={{ color: 'var(--color-text-secondary)' }}>
                  <MapPin size={14} className="text-gray-400" /> {job.location} ({job.workplaceType})
                </span>
                <span className="flex items-center gap-1.5 text-body-sm bg-gray-50 px-3 py-1.5 rounded-md" style={{ color: 'var(--color-text-secondary)' }}>
                  <Briefcase size={14} className="text-gray-400" /> {job.department}
                </span>
                <span className="flex items-center gap-1.5 text-body-sm bg-gray-50 px-3 py-1.5 rounded-md" style={{ color: 'var(--color-text-secondary)' }}>
                  <Clock size={14} className="text-gray-400" /> {job.employmentType}
                </span>
              </div>
            </div>

            {/* Job Details */}
            <div className="hf-card p-6 md:p-8 space-y-8">
              <section>
                <h2 className="text-h3 mb-4" style={{ color: 'var(--gray-900)' }}>About the Role</h2>
                <div className="text-body leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--gray-700)' }}>
                  {job.description}
                </div>
              </section>

              {job.responsibilities?.length > 0 && (
                <>
                  <hr className="hf-divider" />
                  <section>
                    <h2 className="text-h3 mb-4" style={{ color: 'var(--gray-900)' }}>Key Responsibilities</h2>
                    <ul className="space-y-3">
                      {job.responsibilities.map((req, i) => (
                        <li key={i} className="flex items-start gap-3 text-body" style={{ color: 'var(--gray-700)' }}>
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                </>
              )}

              {job.requirements?.length > 0 && (
                <>
                  <hr className="hf-divider" />
                  <section>
                    <h2 className="text-h3 mb-4" style={{ color: 'var(--gray-900)' }}>Requirements</h2>
                    <ul className="space-y-3">
                      {job.requirements.map((req, i) => (
                        <li key={i} className="flex items-start gap-3 text-body" style={{ color: 'var(--gray-700)' }}>
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                </>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="hf-card p-6 sticky top-6">
              <div className="mb-6">
                <ApplyButton jobId={job._id.toString()} hasApplied={hasApplied} />
              </div>
              
              <div className="space-y-4 pt-6 border-t border-gray-100">
                <h3 className="text-h4" style={{ color: 'var(--gray-900)' }}>Job Overview</h3>
                
                <div>
                  <p className="text-caption" style={{ color: 'var(--color-text-muted)' }}>Posted</p>
                  <p className="text-body font-medium mt-0.5" style={{ color: 'var(--gray-900)' }}>{timeAgo(job.createdAt)}</p>
                </div>
                
                <div>
                  <p className="text-caption" style={{ color: 'var(--color-text-muted)' }}>Experience Level</p>
                  <p className="text-body font-medium mt-0.5" style={{ color: 'var(--gray-900)' }}>{job.experienceLevel || 'Not specified'}</p>
                </div>

                {job.salaryRange && (
                  <div>
                    <p className="text-caption" style={{ color: 'var(--color-text-muted)' }}>Salary Range</p>
                    <p className="text-body font-medium mt-0.5" style={{ color: 'var(--gray-900)' }}>{job.salaryRange}</p>
                  </div>
                )}
              </div>

              {job.skills?.length > 0 && (
                <div className="pt-6 mt-6 border-t border-gray-100">
                  <h3 className="text-caption mb-3" style={{ color: 'var(--color-text-muted)' }}>Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill, i) => (
                      <span key={i} className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded border border-gray-200">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="pt-6 mt-6 border-t border-gray-100">
                <button className="flex items-center justify-center gap-2 w-full py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                  <Share2 size={16} /> Share this job
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>
      </div>
    </PageTransition>
  );
}
