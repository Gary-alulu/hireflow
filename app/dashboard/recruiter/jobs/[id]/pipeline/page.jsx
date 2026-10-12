import { redirect } from 'next/navigation';
import connectToDatabase from '@/lib/db';
import Job from '@/models/Job';
import { getSession } from '@/lib/auth';
import PipelineBoard from '@/components/PipelineBoard';

export default async function JobPipelinePage({ params }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect('/login');
  if (session.role !== 'recruiter') redirect('/dashboard');

  await connectToDatabase();
  const job = await Job.findById(id).select('title location department companyId').lean();
  if (!job || job.companyId?.toString() !== session.companyId) {
    redirect(`/dashboard/recruiter/jobs/${id}`);
  }

  return (
    <PipelineBoard
      jobId={id}
      jobTitle={job.title}
      jobLocation={job.location || ''}
      jobDepartment={job.department || ''}
    />
  );
}