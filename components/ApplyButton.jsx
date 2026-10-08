'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ApplyButton({ jobId, hasApplied }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState(hasApplied);
  const [error, setError] = useState('');

  const handleApply = async () => {
    if (applied) return;
    
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (res.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error(data.error || 'Failed to apply');
      }

      setApplied(true);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full md:w-auto">
      <button
        onClick={handleApply}
        disabled={loading || applied}
        className={`w-full px-8 py-3 rounded-md font-medium text-lg shadow-sm ${
          applied 
            ? 'bg-green-100 text-green-800 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {loading ? 'Applying...' : applied ? 'Applied' : 'Apply Now'}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
