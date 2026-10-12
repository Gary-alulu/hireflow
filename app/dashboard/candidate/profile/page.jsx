'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Loader2, CheckCircle2, Plus, Minus, Briefcase, GraduationCap, Award,
  User, Phone, Mail, Link2, Globe, CircleAlert, FileText, Upload, Trash2, Sparkles,
} from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import { computeProfileCompleteness, profileFromForm } from '@/lib/profile';
import { getCvDownloadUrl } from '@/lib/utils';

const uid = () => Math.random().toString(36).slice(2, 9);
const mergeUnique = (current, incoming) => Array.from(new Set([...current, ...incoming]))

const newExperience = () => ({ _i: uid(), title: '', company: '', startDate: '', endDate: '', current: false, description: '' });
const newEducation = () => ({ _i: uid(), institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '' });
const newCertification = () => ({ _i: uid(), name: '', issuer: '', date: '' });

const cleanList = (list) =>
  (list || []).map(({ _i, _e, ...item }) =>
    Object.fromEntries(Object.entries(item).filter(([, v]) => v !== '' && v != null))
  ).filter((item) => Object.keys(item).length > 0);

export default function CandidateProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const [cvBusy, setCvBusy] = useState(false);
  const [cvExtracting, setCvExtracting] = useState(false);
  const [cvMeta, setCvMeta] = useState({ cvTextPresent: false });
  const [cvMessage, setCvMessage] = useState('');
  const [suggestions, setSuggestions] = useState(null);
  const [suggestionsSource, setSuggestionsSource] = useState('');
  const [cvPaste, setCvPaste] = useState('');

  const [formData, setFormData] = useState({
    phone: '',
    location: '',
    profilePhoto: '',
    headline: '',
    professionalSummary: '',
    skills: '',
    portfolioUrl: '',
    linkedInUrl: '',
    githubUrl: '',
    cvUrl: '',
    experience: [],
    education: [],
    certifications: [],
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/candidate/profile');
        if (res.ok) {
          const data = await res.json();
          setEmail(data.email || '');
          setName(data.name || '');
          if (data.profile) {
            const p = data.profile;
            setFormData({
              phone: p.phone || '',
              location: p.location || '',
              profilePhoto: p.profilePhoto || '',
              headline: p.headline || '',
              professionalSummary: p.professionalSummary || '',
              skills: p.skills ? p.skills.join(', ') : '',
              portfolioUrl: p.portfolioUrl || '',
              linkedInUrl: p.linkedInUrl || '',
              githubUrl: p.githubUrl || '',
              cvUrl: p.cvUrl || '',
              experience: (p.experience || []).map((e) => ({ _i: uid(), ...e })),
              education: (p.education || []).map((e) => ({ _i: uid(), ...e })),
              certifications: (p.certifications || []).map((c) => ({ _i: uid(), ...c })),
            });
          }
        }
      } catch (error) {
        console.error('Failed to load profile', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const completeness = useMemo(() => {
    const { experience, education, certifications, skills, ...rest } = formData;
    const profile = profileFromForm({
      ...rest,
      skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
      experience: cleanList(experience),
      education: cleanList(education),
      certifications: cleanList(certifications),
    });
    return computeProfileCompleteness(profile);
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const setItem = (section, idx, patch) =>
    setFormData((prev) => ({
      ...prev,
      [section]: prev[section].map((item, i) => (i === idx ? { ...item, ...patch } : item)),
    }));

  const addItem = (section, factory) =>
    setFormData((prev) => ({ ...prev, [section]: [...prev[section], factory()] }));

  const removeItem = (section, idx) =>
    setFormData((prev) => ({ ...prev, [section]: prev[section].filter((_, i) => i !== idx) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const { experience, education, certifications, skills, ...rest } = formData;
      const payload = {
        ...rest,
        skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
        experience: cleanList(experience),
        education: cleanList(education),
        certifications: cleanList(certifications),
      };

      const res = await fetch('/api/candidate/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to update profile');

      setMessage('success');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageTransition key="loading">
        <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
          <div className="hf-skeleton h-12 w-64 rounded-lg"></div>
          <div className="hf-skeleton h-96 w-full rounded-xl"></div>
        </div>
      </PageTransition>
    );
  }
    const input = (label, name, opts = {}) => (
    <div className={opts.className || 'hf-field'}>
      <label htmlFor={name} className="hf-label">{label}</label>
      <input
        type={opts.type || 'text'}
        name={name}
        id={name}
        value={formData[name] || ''}
        onChange={handleChange}
        className="hf-input"
        placeholder={opts.placeholder}
      />
      {opts.helper && <p className="hf-helper-text">{opts.helper}</p>}
    </div>
  );

  const fetchCvMeta = async () => {
    try {
      const res = await fetch('/api/candidate/cv');
      if (res.ok) {
        const data = await res.json();
        setCvMeta(data.cv || { cvTextPresent: false });
      }
    } catch (error) {
      console.error('Failed to fetch CV meta', error);
    }
  };

  const handleCvUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCvBusy(true);
    setCvMessage('');
    setSuggestions(null);
    try {
      const form = new FormData();
      form.append('cv', file);
      const res = await fetch('/api/candidate/cv', { method: 'PUT', body: form });
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({}));
        setCvMessage(error || 'Upload failed. Try a PDF, DOC, DOCX, RTF or TXT file under 5 MB.');
      } else {
        const data = await res.json();
        setFormData((p) => ({ ...p, cvUrl: data.cvUrl }));
        setCvMeta({ cvTextPresent: Boolean(data.textExtracted) });
        if (data.textExtracted) {
          setCvMessage('cv-ok');
          handleExtractStored();
        } else {
          setCvMessage('cv-no-text');
        }
      }
    } catch (error) {
      console.error('CV upload error', error);
      setCvMessage('Upload failed');
    } finally {
      setCvBusy(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleCvDelete = async () => {
    if (!window.confirm('Delete your uploaded CV?')) return;
    setCvBusy(true);
    try {
      const res = await fetch('/api/candidate/cv', { method: 'DELETE' });
      if (res.ok) {
        setFormData((p) => ({ ...p, cvUrl: '' }));
        setCvMeta({ cvTextPresent: false });
        setSuggestions(null);
        setCvMessage('cv-deleted');
      } else {
        setCvMessage('Delete failed');
      }
    } catch (error) {
      console.error('CV delete error', error);
      setCvMessage('Delete failed');
    } finally {
      setCvBusy(false);
    }
  };

  const handleExtractStored = async () => {
    setCvExtracting(true);
    setCvMessage('');
    try {
      const res = await fetch('/api/candidate/cv/extract');
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({}));
        setCvMessage(error || 'Could not extract from CV');
        return;
      }
      const data = await res.json();
      setSuggestions(data.suggestions);
      setSuggestionsSource('uploaded');
    } catch (error) {
      console.error('Extract error', error);
      setCvMessage('Could not extract from CV');
    } finally {
      setCvExtracting(false);
    }
  };

  const handleExtractPaste = async () => {
    if (!cvPaste.trim()) return;
    setCvExtracting(true);
    setCvMessage('');
    try {
      const res = await fetch('/api/candidate/cv/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cvPaste }),
      });
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({}));
        setCvMessage(error || 'Could not extract from text');
        return;
      }
      const data = await res.json();
      setSuggestions(data.suggestions);
      setSuggestionsSource('pasted');
    } catch (error) {
      console.error('Extract error', error);
      setCvMessage('Could not extract from text');
    } finally {
      setCvExtracting(false);
    }
  };

  const applySuggestions = () => {
    if (!suggestions) return;
    setFormData((p) => {
      const existingSkills = p.skills.split(',').map((s) => s.trim()).filter(Boolean);
      const next = { ...p };
      if (suggestions.skills?.length) next.skills = mergeUnique(existingSkills, suggestions.skills).join(', ');
      if (suggestions.experience?.length) {
        next.experience = [
          ...p.experience,
          ...suggestions.experience.map((exp) => ({
            _i: uid(),
            title: exp.title || '',
            company: exp.company || '',
            startDate: exp.startDate || '',
            endDate: exp.endDate || '',
            current: Boolean(exp.current),
            description: '',
          })),
        ];
      }
      if (suggestions.education?.length) {
        next.education = [
          ...p.education,
          ...suggestions.education.map((edu) => ({
            _i: uid(),
            institution: edu.institution || '',
            degree: edu.degree || '',
            fieldOfStudy: edu.fieldOfStudy || '',
            startDate: edu.startDate || '',
            endDate: edu.endDate || '',
          })),
        ];
      }
      if (!p.professionalSummary && suggestions.summary) next.professionalSummary = suggestions.summary;
      if (!p.headline && suggestions.headline) next.headline = suggestions.headline;
      return next;
    });
    setCvMessage('cv-applied');
  };

  useEffect(() => {
    fetchCvMeta();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PageTransition key="ready">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-h2" style={{ color: 'var(--gray-900)' }}>My Profile</h1>
          <p className="text-body mt-1 flex items-center gap-2" style={{ color: 'var(--color-text-secondary)' }}>
            <User size={15} className="text-gray-400" /> {name || 'Candidate'} · <Mail size={15} className="text-gray-400" /> {email || '—'}
          </p>
        </div>

        {/* Completeness card */}
        <div className="hf-card px-6 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-shrink-0 flex items-center gap-3">
              <div className="h-16 w-16 rounded-full flex items-center justify-center text-lg font-bold" style={{ color: 'var(--color-primary)', background: 'var(--color-primary-soft)' }}>
                {completeness.percent}%
              </div>
              <div>
                <p className="text-body font-semibold" style={{ color: 'var(--gray-900)' }}>Profile {completeness.percent}% complete</p>
                <p className="text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {completeness.complete} of {completeness.total} sections filled. {completeness.percent === 100 ? 'Looks great!' : 'Finish these to stand out:'}
                </p>
              </div>
            </div>
            <div className="flex-1">
              <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${completeness.percent}%`, background: 'var(--color-primary)' }} />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {completeness.sections.filter((s) => !s.complete).map((s) => (
                  <a
                    key={s.key}
                    href={`#${s.anchor}`}
                    className="text-caption inline-flex items-center gap-1 px-2 py-1 rounded-full border"
                    style={{ color: 'var(--color-text-secondary)', borderColor: 'var(--color-border)' }}
                  >
                    <CircleAlert size={12} style={{ color: 'var(--color-warning, #f59e0b)' }} />
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="hf-card">
          <div className="p-6 sm:p-8 space-y-8">

            {message === 'error' && (
              <div className="hf-alert hf-alert-error">Failed to update profile. Please try again.</div>
            )}
            {message === 'success' && (
              <div className="hf-alert hf-alert-success items-center">
                <CheckCircle2 size={16} /> Profile updated successfully!
              </div>
            )}

            {/* Basic */}
            <section id="basic">
              <h3 className="text-h4 mb-4" style={{ color: 'var(--gray-900)' }}>Personal Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="hf-field">
                  <label htmlFor="phone" className="hf-label">Phone Number</label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" name="phone" id="phone" value={formData.phone} onChange={handleChange} className="hf-input pl-9" placeholder="+1 (555) 000-0000" />
                  </div>
                </div>
                <div className="hf-field">
                  <label htmlFor="location" className="hf-label">Location</label>
                  <input type="text" name="location" id="location" value={formData.location} onChange={handleChange} className="hf-input" placeholder="City, State, Country" />
                </div>
              </div>
            </section>

            <hr className="hf-divider" />

            {/* Headline & About */}
            <section id="headline">
              <h3 className="text-h4 mb-4" style={{ color: 'var(--gray-900)' }}>Headline & About</h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {input('Professional Headline', 'headline', { placeholder: 'e.g. Senior Full-Stack Engineer @ Fintech' })}
                  {input('Profile Photo URL', 'profilePhoto', { placeholder: 'https://.../avatar.png' })}
                </div>
                <div className="hf-field">
                  <label htmlFor="professionalSummary" className="hf-label">About You</label>
                  <textarea id="professionalSummary" name="professionalSummary" value={formData.professionalSummary} onChange={handleChange} className="hf-textarea h-32" placeholder="Write a brief summary of your background and career goals..."></textarea>
                </div>
              </div>
            </section>

            <hr className="hf-divider" />

            {/* Skills */}
            <section id="skills">
              <h3 className="text-h4 mb-4" style={{ color: 'var(--gray-900)' }}>Skills</h3>
              {input('Skills', 'skills', { placeholder: 'React, Node.js, Design Systems, Figma', helper: 'List your technical and soft skills, separated by commas.' })}
            </section>

            <hr className="hf-divider" />

            {/* Experience */}
            <section id="experience">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-h4" style={{ color: 'var(--gray-900)' }}>Work Experience</h3>
                <button type="button" onClick={() => addItem('experience', newExperience)} className="hf-btn hf-btn-secondary hf-btn-sm">
                  <Plus size={14} /> Add Experience
                </button>
              </div>
              {formData.experience.length === 0 && (
                <p className="text-body-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>No experience added yet.</p>
              )}
              {formData.experience.map((item, idx) => (
                <div key={item._i} className="border rounded-lg p-4 mb-4" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-body-sm font-medium flex items-center gap-1.5" style={{ color: 'var(--gray-700)' }}>
                      <Briefcase size={14} /> Experience {idx + 1}
                    </span>
                    <button type="button" onClick={() => removeItem('experience', idx)} className="hf-btn hf-btn-ghost hf-btn-sm">
                      <Minus size={14} /> Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="hf-field">
                      <label className="hf-label">Job Title</label>
                      <input type="text" value={item.title} onChange={(e) => setItem('experience', idx, { title: e.target.value })} className="hf-input" placeholder="Job title" />
                    </div>
                    <div className="hf-field">
                      <label className="hf-label">Company</label>
                      <input type="text" value={item.company} onChange={(e) => setItem('experience', idx, { company: e.target.value })} className="hf-input" placeholder="Company" />
                    </div>
                    <div className="hf-field">
                      <label className="hf-label">Start Date</label>
                      <input type="date" value={item.startDate} onChange={(e) => setItem('experience', idx, { startDate: e.target.value })} className="hf-input" />
                    </div>
                    <div className="hf-field">
                      <label className="hf-label">End Date</label>
                      <input type="date" value={item.endDate} disabled={item.current} onChange={(e) => setItem('experience', idx, { endDate: e.target.value })} className="hf-input" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 my-3">
                    <input type="checkbox" id={`current-${idx}`} checked={Boolean(item.current)} onChange={(e) => setItem('experience', idx, { current: e.target.checked, endDate: e.target.checked ? undefined : item.endDate })} className="hf-checkbox" />
                    <label htmlFor={`current-${idx}`} className="text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>I currently work here</label>
                  </div>
                  <div className="hf-field">
                    <label className="hf-label">Description</label>
                    <textarea value={item.description} onChange={(e) => setItem('experience', idx, { description: e.target.value })} className="hf-textarea h-20" placeholder="What did you work on?"></textarea>
                  </div>
                </div>
              ))}
            </section>

            <hr className="hf-divider" />

            {/* Education */}
            <section id="education">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-h4" style={{ color: 'var(--gray-900)' }}>Education</h3>
                <button type="button" onClick={() => addItem('education', newEducation)} className="hf-btn hf-btn-secondary hf-btn-sm">
                  <Plus size={14} /> Add Education
                </button>
              </div>
              {formData.education.length === 0 && (
                <p className="text-body-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>No education added yet.</p>
              )}
              {formData.education.map((item, idx) => (
                <div key={item._i} className="border rounded-lg p-4 mb-4" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-body-sm font-medium flex items-center gap-1.5" style={{ color: 'var(--gray-700)' }}>
                      <GraduationCap size={14} /> Education {idx + 1}
                    </span>
                    <button type="button" onClick={() => removeItem('education', idx)} className="hf-btn hf-btn-ghost hf-btn-sm">
                      <Minus size={14} /> Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="hf-field">
                      <label className="hf-label">Institution</label>
                      <input type="text" value={item.institution} onChange={(e) => setItem('education', idx, { institution: e.target.value })} className="hf-input" placeholder="University / School" />
                    </div>
                    <div className="hf-field">
                      <label className="hf-label">Degree</label>
                      <input type="text" value={item.degree} onChange={(e) => setItem('education', idx, { degree: e.target.value })} className="hf-input" placeholder="Bachelor of Science" />
                    </div>
                    <div className="hf-field">
                      <label className="hf-label">Field of Study</label>
                      <input type="text" value={item.fieldOfStudy} onChange={(e) => setItem('education', idx, { fieldOfStudy: e.target.value })} className="hf-input" placeholder="Computer Science" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="hf-field">
                        <label className="hf-label">Start</label>
                        <input type="date" value={item.startDate} onChange={(e) => setItem('education', idx, { startDate: e.target.value })} className="hf-input" />
                      </div>
                      <div className="hf-field">
                        <label className="hf-label">End</label>
                        <input type="date" value={item.endDate} onChange={(e) => setItem('education', idx, { endDate: e.target.value })} className="hf-input" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </section>

            <hr className="hf-divider" />

            {/* Certifications */}
            <section id="certifications">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-h4" style={{ color: 'var(--gray-900)' }}>Certifications</h3>
                <button type="button" onClick={() => addItem('certifications', newCertification)} className="hf-btn hf-btn-secondary hf-btn-sm">
                  <Plus size={14} /> Add Certification
                </button>
              </div>
              {formData.certifications.length === 0 && (
                <p className="text-body-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>No certifications added yet.</p>
              )}
              {formData.certifications.map((item, idx) => (
                <div key={item._i} className="border rounded-lg p-4 mb-4" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-body-sm font-medium flex items-center gap-1.5" style={{ color: 'var(--gray-700)' }}>
                      <Award size={14} /> Certification {idx + 1}
                    </span>
                    <button type="button" onClick={() => removeItem('certifications', idx)} className="hf-btn hf-btn-ghost hf-btn-sm">
                      <Minus size={14} /> Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="hf-field">
                      <label className="hf-label">Name</label>
                      <input type="text" value={item.name} onChange={(e) => setItem('certifications', idx, { name: e.target.value })} className="hf-input" placeholder="AWS Certified Developer" />
                    </div>
                    <div className="hf-field">
                      <label className="hf-label">Issuer</label>
                      <input type="text" value={item.issuer} onChange={(e) => setItem('certifications', idx, { issuer: e.target.value })} className="hf-input" placeholder="Amazon Web Services" />
                    </div>
                    <div className="hf-field">
                      <label className="hf-label">Date Earned</label>
                      <input type="date" value={item.date} onChange={(e) => setItem('certifications', idx, { date: e.target.value })} className="hf-input" />
                    </div>
                  </div>
                </div>
              ))}
            </section>

            <hr className="hf-divider" />

            {/* Links & Resume */}
            <section id="links">
              <h3 className="text-h4 mb-4" style={{ color: 'var(--gray-900)' }}>Links & Resume</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {input('LinkedIn Profile', 'linkedInUrl', { type: 'url', placeholder: 'https://linkedin.com/in/username' })}
                {input('Portfolio / Website', 'portfolioUrl', { type: 'url', placeholder: 'https://yourwebsite.com' })}
                <div className="hf-field">
                  <label htmlFor="githubUrl" className="hf-label">GitHub Profile</label>
                  <div className="relative">
                    <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="url" name="githubUrl" id="githubUrl" value={formData.githubUrl} onChange={handleChange} className="hf-input pl-9" placeholder="https://github.com/username" />
                  </div>
                </div>
                <div className="hf-field">
                  <label htmlFor="cvUrl" className="hf-label">Resume / CV Link</label>
                  <div className="relative">
                    <Link2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="url" name="cvUrl" id="cvUrl" value={formData.cvUrl} onChange={handleChange} className="hf-input pl-9" placeholder="Link to Google Drive, Dropbox, or personal site" />
                  </div>
                  <p className="hf-helper-text">Provide a public link to your current resume.</p>
                </div>
              </div>
            </section>

          </div>

          <div className="px-6 py-5 bg-gray-50 border-t border-gray-200 rounded-b-lg flex justify-end">
            <button type="submit" disabled={saving} className="hf-btn hf-btn-primary">
              {saving && <Loader2 size={16} className="animate-spin mr-2" />}
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>

        {/* Resume / CV Manager */}
        <div className="hf-card p-6 sm:p-8">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-h4" style={{ color: 'var(--gray-900)' }}>Uploaded Resume / CV</h3>
            {cvExtracting && (
              <span className="text-body-sm flex items-center gap-1.5" style={{ color: 'var(--gray-500)' }}>
                <Loader2 size={14} className="animate-spin" /> Extracting profile fields…
              </span>
            )}
          </div>
          <p className="text-body-sm mb-5" style={{ color: 'var(--color-text-secondary)' }}>
            Upload your CV and HireFlow will suggest profile fields from it. You review and apply them — nothing is saved automatically.
          </p>

          {cvMessage === 'cv-ok' && (
            <div className="hf-alert hf-alert-success items-center mb-4"><CheckCircle2 size={16} /> CV uploaded. Extracting profile fields…</div>
          )}
          {cvMessage === 'cv-no-text' && (
            <div className="hf-alert hf-alert-warning items-center mb-4">
              <CircleAlert size={16} /> CV uploaded, but text couldn't be read from this file type. Paste the text below to extract profile fields.
            </div>
          )}
          {cvMessage === 'cv-deleted' && (
            <div className="hf-alert hf-alert-success items-center mb-4"><CheckCircle2 size={16} /> CV removed.</div>
          )}
          {cvMessage === 'cv-applied' && (
            <div className="hf-alert hf-alert-success items-center mb-4"><CheckCircle2 size={16} /> Suggestions applied below — review, then save your profile.</div>
          )}
          {cvMessage && cvMessage !== 'cv-ok' && cvMessage !== 'cv-no-text' && cvMessage !== 'cv-deleted' && cvMessage !== 'cv-applied' && (
            <div className="hf-alert hf-alert-error mb-4">{cvMessage}</div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {formData.cvUrl ? (
              <>
                <a href={getCvDownloadUrl(formData.cvUrl)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hf-btn hf-btn-secondary">
                  <FileText size={15} /> View CV
                </a>
                <label className="hf-btn hf-btn-primary cursor-pointer inline-flex items-center gap-2">
                  <Upload size={15} /> Replace CV
                  <input type="file" accept=".pdf,.doc,.docx,.rtf,.txt" className="sr-only" onChange={handleCvUpload} disabled={cvBusy} />
                </label>
                <button onClick={handleCvDelete} disabled={cvBusy} className="hf-btn hf-btn-ghost text-red-600 hover:text-red-700 inline-flex items-center gap-2">
                  <Trash2 size={15} /> Delete
                </button>
                <span className="text-body-sm text-gray-400 break-all">{formData.cvUrl.split('?')[0]}</span>
              </>
            ) : (
              <label className="hf-btn hf-btn-primary cursor-pointer inline-flex items-center gap-2">
                <Upload size={15} /> {cvBusy ? 'Uploading…' : 'Upload CV'}
                <input type="file" accept=".pdf,.doc,.docx,.rtf,.txt" className="sr-only" onChange={handleCvUpload} disabled={cvBusy} />
              </label>
            )}
          </div>

          {formData.cvUrl && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {cvMeta.cvTextPresent ? (
                <button onClick={handleExtractStored} disabled={cvExtracting} className="hf-btn hf-btn-secondary hf-btn-sm inline-flex items-center gap-1.5">
                  <Sparkles size={14} /> Re-run profile extraction
                </button>
              ) : null}
              <span className="text-body-xs" style={{ color: 'var(--color-text-muted)' }}>
                PDF / DOC text isn't parsed locally — paste the text to extract profile fields.
              </span>
            </div>
          )}

          <div className="mt-5 hf-divider" />

          <h4 className="text-body font-semibold mb-3 mt-5" style={{ color: 'var(--gray-900)' }}>Extract from pasted CV text</h4>
          <textarea
            value={cvPaste}
            onChange={(e) => setCvPaste(e.target.value)}
            rows={5}
            className="hf-textarea"
            placeholder="Paste the text of your resume here (works for any file type)…"
          />
          <button onClick={handleExtractPaste} disabled={cvExtracting || !cvPaste.trim()} className="hf-btn hf-btn-secondary mt-2 inline-flex items-center gap-1.5">
            <Sparkles size={15} /> Extract profile fields
          </button>

          {suggestions && (
            <div className="mt-6 bg-brand-50 rounded-xl border p-5" style={{ backgroundColor: 'var(--brand-50)', borderColor: 'var(--brand-200)' }}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-body font-semibold inline-flex items-center gap-1.5" style={{ color: 'var(--gray-900)' }}>
                  <Sparkles size={15} style={{ color: 'var(--brand-600)' }} />
                  Extracted from your resume
                  <span className="text-caption font-normal" style={{ color: 'var(--gray-400)' }}>({suggestionsSource})</span>
                </h4>
                <button onClick={applySuggestions} className="hf-btn hf-btn-primary hf-btn-sm">
                  <CheckCircle2 size={14} /> Apply to profile
                </button>
              </div>
              {suggestions.skills?.length > 0 && (
                <div className="mb-4">
                  <p className="text-body-sm font-semibold mb-1.5" style={{ color: 'var(--gray-700)' }}>Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestions.skills.map((skill, i) => (
                      <span key={i} className="px-2 py-1 rounded-md text-xs font-medium" style={{ backgroundColor: '#fff', color: 'var(--brand-700)', border: '1px solid var(--brand-200)' }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {suggestions.experience?.length > 0 && (
                <div className="mb-4">
                  <p className="text-body-sm font-semibold mb-1.5" style={{ color: 'var(--gray-700)' }}>Experience ({suggestions.experience.length})</p>
                  {suggestions.experience.map((exp, i) => (
                    <p key={i} className="text-body-sm" style={{ color: 'var(--gray-600)' }}>
                      <strong style={{ color: 'var(--gray-800)' }}>{exp.title}</strong>
                      {exp.company && <> · {exp.company}</>}
                      {exp.startDate && <> · {exp.startDate.slice(0, 4)}–{exp.current ? 'Present' : (exp.endDate || '')?.slice(0, 4)}</>}
                    </p>
                  ))}
                </div>
              )}
              {suggestions.education?.length > 0 && (
                <div className="mb-4">
                  <p className="text-body-sm font-semibold mb-1.5" style={{ color: 'var(--gray-700)' }}>Education</p>
                  {suggestions.education.map((edu, i) => (
                    <p key={i} className="text-body-sm" style={{ color: 'var(--gray-600)' }}>
                      {edu.degree && <strong style={{ color: 'var(--gray-800)' }}>{edu.degree}</strong>}
                      {edu.institution && <> · {edu.institution}</>}
                    </p>
                  ))}
                </div>
              )}
              {suggestions.summary && (
                <p className="text-body-sm" style={{ color: 'var(--gray-600)' }}>
                  <strong style={{ color: 'var(--gray-800)' }}>Summary:</strong> {suggestions.summary}
                </p>
              )}
              {(suggestions.skills?.length === 0 && suggestions.experience?.length === 0 && suggestions.education?.length === 0) && (
                <p className="text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  No structured fields were detected. Try pasting a more complete resume text.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}