'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Briefcase, Loader2 } from 'lucide-react';
import JobForm from '@/components/JobForm';
import PageTransition from '@/components/PageTransition';

export default function EditJobPage() {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJob() {
      try {
        const res = await fetch(`/api/jobs/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setJob(data.job);
        }
      } catch (error) {
        console.error('Failed to fetch job', error);
      } finally {
        setLoading(false);
      }
    }
    if (params.id) {
      fetchJob();
    }
  }, [params.id]);

  const handleSuccess = () => {
    router.push(`/dashboard/recruiter/jobs/${params.id}`);
  };

  if (loading) {
    return (
      <PageTransition key="edit-loading">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <Loader2 size={20} className="animate-spin text-gray-400" />
            <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>Loading job...</p>
          </div>
          <div className="hf-skeleton h-96 rounded-xl"></div>
        </div>
      </PageTransition>
    );
  }

  if (!job) {
    return (
      <PageTransition key="edit-not-found">
        <div className="hf-empty hf-card">
          <Briefcase size={40} className="text-gray-300 mb-3" />
          <p className="text-body font-medium" style={{ color: 'var(--error-600)' }}>Job not found</p>
          <Link href="/dashboard/recruiter/jobs" className="hf-btn hf-btn-secondary hf-btn-sm mt-4">
            Return to Jobs
          </Link>
        </div>
      </PageTransition>
    );
  }

  return <JobForm jobId={params.id} initialJob={job} onSuccess={handleSuccess} />;
}