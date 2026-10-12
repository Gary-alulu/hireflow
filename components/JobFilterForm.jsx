'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, X } from 'lucide-react';
import Select from '@/components/ui/Select';

const WORKPLACE_OPTIONS = [
  { value: '', label: 'Any workplace' },
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'on-site', label: 'On-site' },
];

const EMPLOYMENT_OPTIONS = [
  { value: '', label: 'Any type' },
  { value: 'Full-time', label: 'Full-time' },
  { value: 'Part-time', label: 'Part-time' },
  { value: 'Contract', label: 'Contract' },
  { value: 'Freelance', label: 'Freelance' },
];

const EXPERIENCE_OPTIONS = [
  { value: '', label: 'Any level' },
  { value: 'Entry-Level', label: 'Entry-Level' },
  { value: 'Mid-Level', label: 'Mid-Level' },
  { value: 'Senior', label: 'Senior' },
  { value: 'Lead', label: 'Lead' },
  { value: 'Executive', label: 'Executive' },
];

const SALARY_OPTIONS = [
  { value: '', label: 'Any salary' },
  { value: '50000', label: '$50k+' },
  { value: '100000', label: '$100k+' },
  { value: '150000', label: '$150k+' },
  { value: '200000', label: '$200k+' },
];

const POSTED_OPTIONS = [
  { value: '', label: 'Any time' },
  { value: '1', label: 'Past 24 hours' },
  { value: '7', label: 'Past 7 days' },
  { value: '30', label: 'Past 30 days' },
];

export default function JobFilterForm({ defaults, industryOptions = [] }) {
  const router = useRouter();
  const [values, setValues] = useState({
    q: defaults.q || '',
    location: defaults.location || '',
    workplaceType: defaults.workplaceType || '',
    employmentType: defaults.employmentType || '',
    experienceLevel: defaults.experienceLevel || '',
    salaryMin: defaults.salaryMin || '',
    industry: defaults.industry || '',
    posted: defaults.posted || '',
  });

  const set = (key, value) => setValues((prev) => ({ ...prev, [key]: value }));

  const submit = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    Object.entries(values).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    const query = params.toString();
    router.push(query ? `/jobs?${query}` : '/jobs');
  };

  const activeFilters = Object.values(values).some(Boolean);

  return (
    <form onSubmit={submit} className="mb-8 space-y-4">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={values.q}
          onChange={(event) => set('q', event.target.value)}
          className="hf-input pl-11 pr-32 py-6 text-base"
          style={{ height: '60px', borderRadius: '12px' }}
          placeholder="Search by job title, skill, or company..."
        />
        <button
          type="submit"
          className="hf-btn hf-btn-primary absolute right-2 top-1/2 -translate-y-1/2 px-5"
          style={{ height: '44px' }}
        >
          Search
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <input
          type="text"
          value={values.location}
          onChange={(event) => set('location', event.target.value)}
          className="hf-input"
          placeholder="Location"
        />
        <Select
          value={values.workplaceType}
          onChange={(value) => set('workplaceType', value)}
          options={WORKPLACE_OPTIONS}
          ariaLabel="Workplace type"
        />
        <Select
          value={values.employmentType}
          onChange={(value) => set('employmentType', value)}
          options={EMPLOYMENT_OPTIONS}
          ariaLabel="Employment type"
        />
        <Select
          value={values.experienceLevel}
          onChange={(value) => set('experienceLevel', value)}
          options={EXPERIENCE_OPTIONS}
          ariaLabel="Experience level"
        />
        <Select
          value={values.salaryMin}
          onChange={(value) => set('salaryMin', value)}
          options={SALARY_OPTIONS}
          ariaLabel="Minimum salary"
        />
        <Select
          value={values.industry}
          onChange={(value) => set('industry', value)}
          options={[{ value: '', label: 'Any industry' }, ...industryOptions.map((industry) => ({ value: industry, label: industry }))]}
          ariaLabel="Industry"
        />
        <Select
          value={values.posted}
          onChange={(value) => set('posted', value)}
          options={POSTED_OPTIONS}
          ariaLabel="Date posted"
        />
        {activeFilters && (
          <Link href="/jobs" className="hf-btn hf-btn-ghost justify-center">
            <X size={14} /> Clear all
          </Link>
        )}
      </div>
    </form>
  );
}
