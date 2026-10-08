'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ArrowLeft, Sparkles } from 'lucide-react';
import PageTransition from '@/components/PageTransition';

export default function CreateJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    employmentType: 'Full-time',
    location: '',
    workplaceType: 'remote',
    salaryRange: '',
    description: '',
    responsibilities: '',
    requirements: '',
    skills: '',
    experienceLevel: 'Mid-Level',
    status: 'draft',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create job');
      }

      router.push('/dashboard/recruiter/jobs');
      router.refresh();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/recruiter/jobs" transitionTypes={['nav-back']} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-h2" style={{ color: 'var(--gray-900)' }}>Create Job</h1>
              <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>
                Publish a new open role to your career page.
              </p>
            </div>
          </div>
          <button type="button" className="hf-btn hf-btn-secondary">
            <Sparkles size={16} className="text-purple-600" />
            Generate with AI
          </button>
        </div>

        <form onSubmit={handleSubmit} className="hf-card">
          <div className="p-6 sm:p-8 space-y-8">
            
            {error && (
              <div className="hf-alert hf-alert-error">
                {error}
              </div>
            )}

            {/* Section 1: Basic Info */}
            <div>
              <h3 className="text-h4 mb-4" style={{ color: 'var(--gray-900)' }}>Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 hf-field">
                  <label htmlFor="title" className="hf-label">Job Title</label>
                  <input type="text" name="title" id="title" required value={formData.title} onChange={handleChange} className="hf-input" placeholder="e.g. Senior Frontend Engineer" />
                </div>
                <div className="hf-field">
                  <label htmlFor="department" className="hf-label">Department</label>
                  <input type="text" name="department" id="department" required value={formData.department} onChange={handleChange} className="hf-input" placeholder="e.g. Engineering" />
                </div>
                <div className="hf-field">
                  <label htmlFor="employmentType" className="hf-label">Employment Type</label>
                  <select name="employmentType" id="employmentType" value={formData.employmentType} onChange={handleChange} className="hf-select">
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                </div>
                <div className="hf-field">
                  <label htmlFor="experienceLevel" className="hf-label">Experience Level</label>
                  <select name="experienceLevel" id="experienceLevel" value={formData.experienceLevel} onChange={handleChange} className="hf-select">
                    <option value="Entry-Level">Entry-Level</option>
                    <option value="Mid-Level">Mid-Level</option>
                    <option value="Senior">Senior</option>
                    <option value="Lead">Lead</option>
                    <option value="Executive">Executive</option>
                  </select>
                </div>
                <div className="hf-field">
                  <label htmlFor="salaryRange" className="hf-label">Salary Range (Optional)</label>
                  <input type="text" name="salaryRange" id="salaryRange" value={formData.salaryRange} onChange={handleChange} className="hf-input" placeholder="e.g. $100k - $120k" />
                </div>
              </div>
            </div>

            <hr className="hf-divider" />

            {/* Section 2: Location */}
            <div>
              <h3 className="text-h4 mb-4" style={{ color: 'var(--gray-900)' }}>Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="hf-field">
                  <label htmlFor="workplaceType" className="hf-label">Workplace Type</label>
                  <select name="workplaceType" id="workplaceType" value={formData.workplaceType} onChange={handleChange} className="hf-select">
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="on-site">On-site</option>
                  </select>
                </div>
                <div className="hf-field">
                  <label htmlFor="location" className="hf-label">Location Details</label>
                  <input type="text" name="location" id="location" required value={formData.location} onChange={handleChange} className="hf-input" placeholder="e.g. New York, NY or Worldwide" />
                </div>
              </div>
            </div>

            <hr className="hf-divider" />

            {/* Section 3: Details */}
            <div>
              <h3 className="text-h4 mb-4" style={{ color: 'var(--gray-900)' }}>Job Details</h3>
              <div className="space-y-6">
                <div className="hf-field">
                  <label htmlFor="description" className="hf-label">Description</label>
                  <textarea id="description" name="description" required value={formData.description} onChange={handleChange} className="hf-textarea h-32" placeholder="Write a brief overview of the role..."></textarea>
                </div>
                <div className="hf-field">
                  <label htmlFor="responsibilities" className="hf-label">Responsibilities (One per line)</label>
                  <textarea id="responsibilities" name="responsibilities" value={formData.responsibilities} onChange={handleChange} className="hf-textarea h-32" placeholder="- Develop features...&#10;- Mentor junior engineers..."></textarea>
                </div>
                <div className="hf-field">
                  <label htmlFor="requirements" className="hf-label">Requirements (One per line)</label>
                  <textarea id="requirements" name="requirements" value={formData.requirements} onChange={handleChange} className="hf-textarea h-32" placeholder="- 5+ years experience...&#10;- Degree in CS..."></textarea>
                </div>
                <div className="hf-field">
                  <label htmlFor="skills" className="hf-label">Required Skills (Comma separated)</label>
                  <input type="text" name="skills" id="skills" value={formData.skills} onChange={handleChange} className="hf-input" placeholder="React, Node.js, MongoDB" />
                </div>
              </div>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="px-6 py-5 bg-gray-50 border-t border-gray-200 rounded-b-lg flex items-center justify-between">
            <div className="hf-field" style={{ width: '200px' }}>
              <select name="status" id="status" value={formData.status} onChange={handleChange} className="hf-select bg-white">
                <option value="draft">Save as Draft</option>
                <option value="active">Publish Immediately</option>
              </select>
            </div>
            
            <div className="flex gap-3">
              <Link href="/dashboard/recruiter/jobs" className="hf-btn hf-btn-ghost">
                Cancel
              </Link>
              <button type="submit" disabled={loading} className="hf-btn hf-btn-primary">
                {loading && <Loader2 size={16} className="animate-spin mr-2" />}
                {formData.status === 'active' ? 'Publish Job' : 'Save Job'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </PageTransition>
  );
}
