'use client';

import { useRouter } from 'next/navigation';

export default function ApplyButton({ jobId, hasApplied }) {
  const router = useRouter();

  const handleApply = () => {
    if (hasApplied) return;
    router.push(`/jobs/${jobId}/apply`);
  };

  return (
    <div className="w-full md:w-auto">
      <button
        onClick={handleApply}
        disabled={hasApplied}
        className={`w-full px-8 py-3 rounded-md font-medium text-lg shadow-sm ${
          hasApplied
            ? 'bg-green-100 text-green-800 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {hasApplied ? 'Applied' : 'Apply Now'}
      </button>
    </div>
  );
}
