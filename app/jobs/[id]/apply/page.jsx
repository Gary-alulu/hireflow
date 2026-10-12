export const dynamic = 'force-dynamic';

import connectToDatabase from '@/lib/db';
import Job from '@/models/Job';
import Company from '@/models/Company';
import Application from '@/models/Application';
import CandidateProfile from '@/models/CandidateProfile';
import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import PageTransition from '@/components/PageTransition';
import ApplicationForm from '@/components/ApplicationForm';
import Footer from '@/components/Footer';

export default async function JobApplyPage({ params }) {
  await connectToDatabase();
  const { id } = await params;

  const job = await Job.findById(id).populate('companyId', 'name logo industry').lean();
  if (!job || job.status !== 'active') notFound();

  const session = await getSession();
  if (!session) redirect('/login');
  if (session.role !== 'candidate') redirect(`/jobs/${id}`);

  const [profile, existing] = await Promise.all([
    CandidateProfile.findOne({ userId: session.userId }).lean(),
    Application.findOne({ jobId: id, candidateId: session.userId }).lean(),
  ]);

  if (existing) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gray-50 flex flex-col hf-in">
          <div className="flex-1 max-w-2xl mx-auto px-4 py-16 w-full">
            <div className="hf-card px-6 py-10 text-center">
              <div className="text-h2 mb-2" style={{ color: 'var(--gray-900)' }}>You&apos;ve already applied</div>
              <p className="text-body mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                Your application for {job.title} is already in. Track its status from your dashboard.
              </p>
              <a href="/dashboard/candidate/applications" className="hf-btn hf-btn-primary">
                View my applications
              </a>
            </div>
          </div>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  const jobJSON = JSON.parse(JSON.stringify(job));
  const profileJSON = JSON.parse(JSON.stringify(profile || null));
  const userInfo = { name: session.name, email: session.email };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col hf-in">
      <div className="flex-1">
        <ApplicationForm job={jobJSON} profile={profileJSON} user={userInfo} />
      </div>
      <Footer />
    </div>
  );
}