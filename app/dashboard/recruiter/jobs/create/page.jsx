'use client';

import { useRouter } from 'next/navigation';
import JobForm from '@/components/JobForm';

export default function CreateJobPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/dashboard/recruiter/jobs');
  };

  return <JobForm onSuccess={handleSuccess} />;
}