'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ArrowLeft, Sparkles, Plus, X } from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import Select from '@/components/ui/Select';

const EMPLOYMENT_TYPE_OPTIONS = ['Full-time', 'Part-time', 'Contract', 'Freelance'];
const EXPERIENCE_LEVEL_OPTIONS = ['Entry-Level', 'Mid-Level', 'Senior', 'Lead', 'Executive'];
const WORKPLACE_TYPE_OPTIONS = [
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'on-site', label: 'On-site' },
];

function arraysToText(values) {
  return Array.isArray(values) ? values.join('\n') : '';
}

function toDateInputValue(value) {
  if (!value) return '';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
}

export default function JobForm({ jobId, initialJob, onSuccess }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const status = initialJob?.status || 'draft';
  const statusLocked = status === 'paused' || status === 'closed';

  const [formData, setFormData] = useState({
    title: initialJob?.title || '',
    department: initialJob?.department || '',
    employmentType: initialJob?.employmentType || 'Full-time',
    location: initialJob?.location || '',
    workplaceType: initialJob?.workplaceType || 'remote',
    salaryRange: initialJob?.salaryRange || '',
    description: initialJob?.description || '',
    responsibilities: arraysToText(initialJob?.responsibilities),
    requirements: arraysToText(initialJob?.requirements),
    benefits: arraysToText(initialJob?.benefits),
    customQuestions: Array.isArray(initialJob?.customQuestions)
      ? initialJob.customQuestions.map((q) => ({ question: q.question || '', required: Boolean(q.required) }))
      : (initialJob?.questions || []).map((q) => ({ question: q, required: false })),
    skills: Array.isArray(initialJob?.skills) ? initialJob.skills.join(', ') : '',
    experienceLevel: initialJob?.experienceLevel || 'Mid-Level',
    status: status,
    applicationDeadline: toDateInputValue(initialJob?.applicationDeadline),
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addQuestion = () => {
    setFormData((prev) => ({
      ...prev,
      customQuestions: [...prev.customQuestions, { question: '', required: false }],
    }));
  };

  const updateQuestion = (index, value) => {
    setFormData((prev) => ({
      ...prev,
      customQuestions: prev.customQuestions.map((q, i) => (i === index ? { ...q, question: value } : q)),
    }));
  };

  const toggleRequired = (index, required) => {
    setFormData((prev) => ({
      ...prev,
      customQuestions: prev.customQuestions.map((q, i) => (i === index ? { ...q, required } : q)),
    }));
  };

  const removeQuestion = (index) => {
    setFormData((prev) => ({
      ...prev,
      customQuestions: prev.customQuestions.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(jobId ? `/api/jobs/${jobId}` : '/api/jobs', {
        method: jobId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save job');
      }

      const data = await res.json();
      onSuccess(data.job);
      router.refresh();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const backHref = jobId ? `/dashboard/recruiter/jobs/${jobId}` : '/dashboard/recruiter/jobs';

  return (
    <PageTransition key="job-form">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={backHref} transitionTypes={['nav-back']} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-h2" style={{ color: 'var(--gray-900)' }}>
                {jobId ? 'Edit Job' : 'Create Job'}
              </h1>
              <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>
                {jobId ? 'Update the details for this role.' : 'Publish a new open role to your career page.'}
              </p>
            </div>
          </div>
          {!jobId && (
            <button type="button" className="hf-btn hf-btn-secondary">
              <Sparkles size={16} className="text-purple-600" />
              Generate with AI
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="hf-card">
          <div className="p-6 sm:p-8 space-y-8">
            {error && (
              <div className="hf-alert hf-alert-error">
                {error}
              </div>
            )}

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
                  <Select
                    id="employmentType"
                    value={formData.employmentType}
                    onChange={(value) => setFormData((prev) => ({ ...prev, employmentType: value }))}
                    options={EMPLOYMENT_TYPE_OPTIONS}
                    ariaLabel="Employment Type"
                  />
                </div>
                <div className="hf-field">
                  <label htmlFor="experienceLevel" className="hf-label">Experience Level</label>
                  <Select
                    id="experienceLevel"
                    value={formData.experienceLevel}
                    onChange={(value) => setFormData((prev) => ({ ...prev, experienceLevel: value }))}
                    options={EXPERIENCE_LEVEL_OPTIONS}
                    ariaLabel="Experience Level"
                  />
                </div>
                <div className="hf-field">
                  <label htmlFor="salaryRange" className="hf-label">Salary Range (Optional)</label>
                  <input type="text" name="salaryRange" id="salaryRange" value={formData.salaryRange} onChange={handleChange} className="hf-input" placeholder="e.g. $100k - $120k" />
                </div>
              </div>
            </div>

            <hr className="hf-divider" />

            <div>
              <h3 className="text-h4 mb-4" style={{ color: 'var(--gray-900)' }}>Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="hf-field">
                  <label htmlFor="workplaceType" className="hf-label">Workplace Type</label>
                  <Select
                    id="workplaceType"
                    value={formData.workplaceType}
                    onChange={(value) => setFormData((prev) => ({ ...prev, workplaceType: value }))}
                    options={WORKPLACE_TYPE_OPTIONS}
                    ariaLabel="Workplace Type"
                  />
                </div>
                <div className="hf-field">
                  <label htmlFor="location" className="hf-label">Location Details</label>
                  <input type="text" name="location" id="location" required value={formData.location} onChange={handleChange} className="hf-input" placeholder="e.g. New York, NY or Worldwide" />
                </div>
              </div>
            </div>

            <hr className="hf-divider" />

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
                  <label htmlFor="benefits" className="hf-label">Benefits (One per line, optional)</label>
                  <textarea id="benefits" name="benefits" value={formData.benefits} onChange={handleChange} className="hf-textarea h-24" placeholder="- Health insurance&#10;- Stock options..."></textarea>
                </div>
                <div className="hf-field">
                  <label className="hf-label">Application Questions (optional)</label>
                  <p className="hf-helper-text mb-3">Ask candidates up to 10 questions, like &quot;How many years of React experience do you have?&quot; or &quot;Are you willing to relocate?&quot; Mark any question as required.</p>
                  <div className="space-y-3">
                    {formData.customQuestions.map((q, i) => (
                      <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <input
                          type="text"
                          value={q.question}
                          onChange={(e) => updateQuestion(i, e.target.value)}
                          className="hf-input flex-1"
                          placeholder="e.g. How many years of React experience do you have?"
                        />
                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-1.5 text-body-sm whitespace-nowrap cursor-pointer" style={{ color: 'var(--gray-700)' }}>
                            <input type="checkbox" checked={q.required} onChange={(e) => toggleRequired(i, e.target.checked)} className="h-4 w-4 rounded border-gray-300" />
                            Required
                          </label>
                          <button
                            type="button"
                            onClick={() => removeQuestion(i)}
                            className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            aria-label="Remove question"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {formData.customQuestions.length < 10 && (
                      <button type="button" onClick={addQuestion} className="hf-btn hf-btn-secondary hf-btn-sm">
                        <Plus size={15} className="mr-1.5" /> Add question
                      </button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="hf-field">
                    <label htmlFor="skills" className="hf-label">Required Skills (Comma separated)</label>
                    <input type="text" name="skills" id="skills" value={formData.skills} onChange={handleChange} className="hf-input" placeholder="React, Node.js, MongoDB" />
                  </div>
                  <div className="hf-field">
                    <label htmlFor="applicationDeadline" className="hf-label">Application Deadline (Optional)</label>
                    <input type="date" name="applicationDeadline" id="applicationDeadline" value={formData.applicationDeadline} onChange={handleChange} className="hf-input" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-5 bg-gray-50 border-t border-gray-200 rounded-b-lg flex items-center justify-between">
            <div className="hf-field" style={{ width: '200px' }}>
              <Select
                id="status"
                value={formData.status}
                disabled={statusLocked}
                onChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
                options={
                  statusLocked
                    ? [{ value: status, label: `${status.charAt(0).toUpperCase() + status.slice(1)} (locked)` }]
                    : [
                        { value: 'draft', label: 'Save as Draft' },
                        { value: 'active', label: 'Publish Immediately' },
                      ]
                }
                ariaLabel="Job status"
                menuMinWidth={200}
              />
            </div>

            <div className="flex gap-3">
              <Link href={backHref} className="hf-btn hf-btn-ghost">
                Cancel
              </Link>
              <button type="submit" disabled={loading} className="hf-btn hf-btn-primary">
                {loading && <Loader2 size={16} className="animate-spin mr-2" />}
                {jobId ? 'Save Changes' : formData.status === 'active' ? 'Publish Job' : 'Save Job'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </PageTransition>
  );
}