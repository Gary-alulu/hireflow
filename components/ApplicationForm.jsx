'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Upload, FileText, Link2, Briefcase, MapPin, Clock,
  CheckCircle2, Loader2, Building, User, Mail, Phone, Calendar, DollarSign,
} from 'lucide-react';

function resumePath(value) {
  if (!value) return '';
  try {
    return new URL(value, 'http://localhost').pathname;
  } catch {
    return value;
  }
}

export default function ApplicationForm({ job, profile, user }) {
  const [cvMode, setCvMode] = useState(profile?.cvUrl ? 'profile' : 'upload');
  const [cvFile, setCvFile] = useState(null);
  const [manualCvUrl, setManualCvUrl] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [portfolio, setPortfolio] = useState(profile?.portfolioUrl || profile?.githubUrl || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const cvFileRef = useRef(null);

  // Custom questions (recruiter-defined, optionally required) plus any legacy
  // free-text questions saved before the structured editor existed.
  const customQuestions = Array.isArray(job?.customQuestions) ? job.customQuestions : [];
  const legacyQuestions = (job?.questions || []).filter(
    (q) => !customQuestions.some((cq) => cq.question === q)
  );
  const questions = [
    ...customQuestions.map((q) => ({ question: q.question, required: Boolean(q.required) })),
    ...legacyQuestions.map((q) => ({ question: q, required: false })),
  ];
  const [answers, setAnswers] = useState(questions.map(() => ''));

  const pickFile = (e) => {
    setCvFile(e.target.files?.[0] || null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    if (cvMode === 'upload' && !cvFile) {
      setError('Please choose a CV file to upload.');
      setSubmitting(false);
      return;
    }
    if (cvMode === 'manual' && !manualCvUrl.trim()) {
      setError('Please paste a link to your resume.');
      setSubmitting(false);
      return;
    }

    const missingRequired = questions
      .map((q, i) => ({ q, answered: (answers[i] || '').trim() }))
      .filter(({ q, answered }) => q.required && !answered);
    if (missingRequired.length > 0) {
      setError('Please answer all required application questions.');
      setSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append('jobId', job._id);
    formData.append('coverLetter', coverLetter);
    formData.append('portfolioUrl', portfolio);
    formData.append('answers', JSON.stringify(
      questions.map((q, i) => ({ question: q.question, answer: answers[i], required: q.required })).filter((a) => (a.answer || '').trim())
    ));
    if (cvMode === 'manual') {
      formData.append('cvUrl', manualCvUrl.trim());
    }
    if (cvMode === 'upload' && cvFile) {
      formData.append('cvFile', cvFile);
    }

    try {
      const res = await fetch('/api/applications', { method: 'POST', body: formData });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Failed to submit your application.');
        return;
      }
      setSubmitted(true);
    } catch (err) {
      setError('Failed to submit your application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex-1 max-w-2xl mx-auto px-4 py-16 w-full">
        <div className="hf-card px-6 py-10 text-center">
          <div className="mx-auto h-14 w-14 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <CheckCircle2 size={28} className="text-green-600" />
          </div>
          <h1 className="text-h2 mb-2" style={{ color: 'var(--gray-900)' }}>Application submitted</h1>
          <p className="text-body mb-2" style={{ color: 'var(--color-text-secondary)' }}>
            Your application for <strong className="font-semibold" style={{ color: 'var(--gray-900)' }}>{job.title}</strong> at {job.companyId?.name || 'HireFlow Enterprise'} is in.
          </p>
          <p className="text-body-sm mb-8" style={{ color: 'var(--color-text-muted)' }}>
            Recruiters will review your CV, cover letter and answers. Track progress in your dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="/dashboard/candidate/applications" className="hf-btn hf-btn-primary">
              Track application status
            </a>
            <a href="/jobs" className="hf-btn hf-btn-secondary">
              Browse more jobs
            </a>
          </div>
        </div>
      </div>
    );
  }

  const dayjs = (d) => new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href={`/jobs/${job._id}`} className="flex items-center gap-2 text-sm font-medium hover:text-blue-600 transition-colors" style={{ color: 'var(--color-text-secondary)' }}>
          <ArrowLeft size={16} /> Back to job
        </Link>
        <span className="text-caption" style={{ color: 'var(--color-text-muted)' }}>Step 1 of 1 · Application</span>
      </div>

      {/* Job summary */}
      <div className="hf-card px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h1 className="text-h2" style={{ color: 'var(--gray-900)' }}>{job.title}</h1>
          <p className="text-body flex items-center gap-1.5 mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            <Building size={15} /> {job.companyId?.name || 'HireFlow Enterprise'}
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>
          <span className="flex items-center gap-1.5"><MapPin size={14} className="text-gray-400" /> {job.location} ({job.workplaceType})</span>
          <span className="flex items-center gap-1.5"><Clock size={14} className="text-gray-400" /> {job.employmentType}</span>
          {job.salaryRange && <span className="flex items-center gap-1.5"><DollarSign size={14} className="text-gray-400" /> {job.salaryRange}</span>}
          {job.applicationDeadline && <span className="flex items-center gap-1.5"><Calendar size={14} className="text-gray-400" /> Apply by {dayjs(job.applicationDeadline)}</span>}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="hf-card">
        <div className="p-6 sm:p-8 space-y-8">

          {error && (
            <div className="hf-alert hf-alert-error">{error}</div>
          )}

          {/* Profile information */}
          <section>
            <h2 className="text-h3 mb-4" style={{ color: 'var(--gray-900)' }}>Your Information</h2>
            <div className="rounded-xl border p-5" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-soft, #fafafa)' }}>
              <div className="flex items-start justify-between gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-body-sm flex-1">
                  <div className="flex items-center gap-2"><User size={14} className="text-gray-400" /> <span style={{ color: 'var(--gray-700)' }}>{user.name || '—'}</span></div>
                  <div className="flex items-center gap-2"><Mail size={14} className="text-gray-400" /> <span className="truncate" style={{ color: 'var(--gray-700)' }}>{user.email}</span></div>
                  <div className="flex items-center gap-2"><Phone size={14} className="text-gray-400" /> <span style={{ color: 'var(--gray-700)' }}>{profile?.phone || <span className="italic text-gray-400">Not set</span>}</span></div>
                  <div className="flex items-center gap-2"><MapPin size={14} className="text-gray-400" /> <span style={{ color: 'var(--gray-700)' }}>{profile?.location || <span className="italic text-gray-400">Not set</span>}</span></div>
                  {profile?.headline && (
                    <div className="sm:col-span-2"><span className="font-medium" style={{ color: 'var(--gray-700)' }}>{profile.headline}</span></div>
                  )}
                </div>
                <a href="/dashboard/candidate/profile" className="hf-btn hf-btn-secondary hf-btn-sm flex-shrink-0">Edit profile</a>
              </div>
              {profile?.skills?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                  {profile.skills.map((skill, i) => (
                    <span key={i} className="px-2.5 py-1 bg-white text-gray-700 text-xs font-medium rounded border" style={{ borderColor: 'var(--color-border)' }}>{skill}</span>
                  ))}
                </div>
              )}
            </div>
          </section>

          <hr className="hf-divider" />

          {/* CV */}
          <section>
            <h2 className="text-h3 mb-2" style={{ color: 'var(--gray-900)' }}>Resume / CV</h2>
            <p className="text-body-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>Choose one way to share your resume. PDF, DOC, DOCX, RTF or TXT, up to 5 MB.</p>

            <div className="space-y-3">
              {(profile?.cvUrl) && (
                <label className="flex items-start gap-3 border rounded-lg p-4 cursor-pointer" style={{ borderColor: cvMode === 'profile' ? 'var(--color-primary)' : 'var(--color-border)' }}>
                  <input type="radio" name="cvMode" checked={cvMode === 'profile'} onChange={() => setCvMode('profile')} className="mt-0.5 hf-radio" />
                  <span className="text-body-sm" style={{ color: 'var(--gray-700)' }}>
                    <span className="font-medium block">Use my resume on file</span>
                    <span className="flex items-center gap-1 mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                      <FileText size={13} /> {resumePath(profile.cvUrl) || profile.cvUrl}
                    </span>
                  </span>
                </label>
              )}

              <label className="flex items-start gap-3 border rounded-lg p-4 cursor-pointer" style={{ borderColor: cvMode === 'upload' ? 'var(--color-primary)' : 'var(--color-border)' }}>
                <input type="radio" name="cvMode" checked={cvMode === 'upload'} onChange={() => setCvMode('upload')} className="mt-0.5 hf-radio" />
                <span className="text-body-sm flex-1" style={{ color: 'var(--gray-700)' }}>
                  <span className="font-medium block">Upload a new CV</span>
                  {cvMode === 'upload' && (
                    <span className="mt-2 block">
                      <button type="button" onClick={() => cvFileRef.current?.click()} className="inline-flex items-center gap-2 hf-btn hf-btn-secondary hf-btn-sm">
                        <Upload size={14} /> Choose file
                      </button>
                      <input
                        ref={cvFileRef}
                        type="file"
                        accept=".pdf,.doc,.docx,.rtf,.txt,application/pdf"
                        className="hidden"
                        onChange={pickFile}
                      />
                      {cvFile && (
                        <span className="ml-3 inline-flex items-center gap-1 text-caption" style={{ color: 'var(--color-text-secondary)' }}>
                          <FileText size={13} /> {cvFile.name} ({(cvFile.size / 1024).toFixed(0)} KB)
                        </span>
                      )}
                    </span>
                  )}
                </span>
              </label>

              <label className="flex items-start gap-3 border rounded-lg p-4 cursor-pointer" style={{ borderColor: cvMode === 'manual' ? 'var(--color-primary)' : 'var(--color-border)' }}>
                <input type="radio" name="cvMode" checked={cvMode === 'manual'} onChange={() => setCvMode('manual')} className="mt-0.5 hf-radio" />
                <span className="text-body-sm flex-1" style={{ color: 'var(--gray-700)' }}>
                  <span className="font-medium block">Provide a link</span>
                  {cvMode === 'manual' && (
                    <span className="mt-2 block">
                      <input
                        type="url"
                        value={manualCvUrl}
                        onChange={(e) => setManualCvUrl(e.target.value)}
                        className="hf-input h-10 text-sm"
                        placeholder="https://drive.google.com/... or your resume URL"
                      />
                    </span>
                  )}
                </span>
              </label>
            </div>
          </section>

          <hr className="hf-divider" />

          {/* Cover letter */}
          <section>
            <h2 className="text-h3 mb-2" style={{ color: 'var(--gray-900)' }}>Cover Letter</h2>
            <p className="text-body-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>Optional, but a strong cover letter helps you stand out.</p>
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows={5}
              maxLength={4000}
              className="hf-textarea"
              placeholder={`Introduce yourself to the team at ${job.companyId?.name || 'HireFlow Enterprise'}. Why are you a great fit for this role?`}
            />
          </section>

          <hr className="hf-divider" />

          {/* Portfolio */}
          <section>
            <h2 className="text-h3 mb-2" style={{ color: 'var(--gray-900)' }}>Portfolio</h2>
            <p className="text-body-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>Optional. A link to your portfolio, GitHub or personal site.</p>
            <div className="relative">
              <Link2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="url"
                value={portfolio}
                onChange={(e) => setPortfolio(e.target.value)}
                className="hf-input pl-9"
                placeholder="https://github.com/username"
              />
            </div>
          </section>

          {questions.length > 0 && (
            <>
              <hr className="hf-divider" />
              <section>
                <h2 className="text-h3 mb-2" style={{ color: 'var(--gray-900)' }}>Application Questions</h2>
                <p className="text-body-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                  The hiring team reads these answers carefully.
                </p>
                <div className="space-y-5">
                  {questions.map((q, i) => (
                    <div key={i} className="hf-field">
                      <label htmlFor={`answer-${i}`} className="hf-label">
                        {i + 1}. {q.question}
                        {q.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      <textarea
                        id={`answer-${i}`}
                        value={answers[i] || ''}
                        onChange={(e) => setAnswers((prev) => prev.map((a, j) => (j === i ? e.target.value : a)))}
                        rows={4}
                        maxLength={4000}
                        className="hf-textarea"
                        placeholder={`${q.required ? 'Required. ' : ''}Your answer...`}
                      />
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>

        <div className="px-6 py-5 bg-gray-50 border-t border-gray-200 rounded-b-lg flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
          <p className="text-caption" style={{ color: 'var(--color-text-muted)' }}>
            A snapshot of your profile is sent with this application.
          </p>
          <button type="submit" disabled={submitting} className="hf-btn hf-btn-primary">
            {submitting && <Loader2 size={16} className="animate-spin mr-2" />}
            {submitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </form>
    </div>
  );
}