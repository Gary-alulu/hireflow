'use client';

import { useState, useEffect } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';
import PageTransition from '@/components/PageTransition';

export default function CandidateProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  const [formData, setFormData] = useState({
    phone: '',
    location: '',
    professionalSummary: '',
    skills: '', 
    portfolioUrl: '',
    linkedInUrl: '',
    cvUrl: '',
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/candidate/profile');
        if (res.ok) {
          const data = await res.json();
          if (data.profile) {
            setFormData({
              phone: data.profile.phone || '',
              location: data.profile.location || '',
              professionalSummary: data.profile.professionalSummary || '',
              skills: data.profile.skills ? data.profile.skills.join(', ') : '',
              portfolioUrl: data.profile.portfolioUrl || '',
              linkedInUrl: data.profile.linkedInUrl || '',
              cvUrl: data.profile.cvUrl || '',
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const payload = {
        ...formData,
        skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
      };

      const res = await fetch('/api/candidate/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to update profile');
      
      setMessage('success');
      setTimeout(() => setMessage(''), 3000); // Clear success message after 3s
    } catch (err) {
      setMessage('error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageTransition key={loading ? 'loading' : 'ready'}>
        <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
          <div className="hf-skeleton h-12 w-64 rounded-lg"></div>
          <div className="hf-skeleton h-96 w-full rounded-xl"></div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition key={loading ? 'loading' : 'ready'}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-h2" style={{ color: 'var(--gray-900)' }}>My Profile</h1>
          <p className="text-body mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            Keep your profile updated to stand out to recruiters.
          </p>
        </div>
      
        <form onSubmit={handleSubmit} className="hf-card">
          <div className="p-6 sm:p-8 space-y-8">
          
            {message === 'error' && (
              <div className="hf-alert hf-alert-error">
                Failed to update profile. Please try again.
              </div>
            )}

            {message === 'success' && (
              <div className="hf-alert hf-alert-success items-center">
                <CheckCircle2 size={16} />
                Profile updated successfully!
              </div>
            )}

            {/* Section: Personal Info */}
            <div>
              <h3 className="text-h4 mb-4" style={{ color: 'var(--gray-900)' }}>Personal Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="hf-field">
                  <label htmlFor="phone" className="hf-label">Phone Number</label>
                  <input type="text" name="phone" id="phone" value={formData.phone} onChange={handleChange} className="hf-input" placeholder="+1 (555) 000-0000" />
                </div>
                <div className="hf-field">
                  <label htmlFor="location" className="hf-label">Location</label>
                  <input type="text" name="location" id="location" value={formData.location} onChange={handleChange} className="hf-input" placeholder="City, State, Country" />
                </div>
              </div>
            </div>

            <hr className="hf-divider" />

            {/* Section: Professional Summary */}
            <div>
              <h3 className="text-h4 mb-4" style={{ color: 'var(--gray-900)' }}>Professional Summary</h3>
              <div className="space-y-6">
                <div className="hf-field">
                  <label htmlFor="professionalSummary" className="hf-label">About You</label>
                  <textarea id="professionalSummary" name="professionalSummary" value={formData.professionalSummary} onChange={handleChange} className="hf-textarea h-32" placeholder="Write a brief summary of your background and career goals..."></textarea>
                </div>
                <div className="hf-field">
                  <label htmlFor="skills" className="hf-label">Skills</label>
                  <input type="text" name="skills" id="skills" value={formData.skills} onChange={handleChange} className="hf-input" placeholder="React, Node.js, Design Systems, Figma (comma separated)" />
                  <p className="hf-helper-text">List your technical and soft skills, separated by commas.</p>
                </div>
              </div>
            </div>

            <hr className="hf-divider" />

            {/* Section: Links & Resume */}
            <div>
              <h3 className="text-h4 mb-4" style={{ color: 'var(--gray-900)' }}>Links & Resume</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="hf-field">
                  <label htmlFor="linkedInUrl" className="hf-label">LinkedIn Profile</label>
                  <input type="url" name="linkedInUrl" id="linkedInUrl" value={formData.linkedInUrl} onChange={handleChange} className="hf-input" placeholder="https://linkedin.com/in/username" />
                </div>
                <div className="hf-field">
                  <label htmlFor="portfolioUrl" className="hf-label">Portfolio / Website</label>
                  <input type="url" name="portfolioUrl" id="portfolioUrl" value={formData.portfolioUrl} onChange={handleChange} className="hf-input" placeholder="https://yourwebsite.com" />
                </div>
                <div className="sm:col-span-2 hf-field">
                  <label htmlFor="cvUrl" className="hf-label">Resume / CV Link</label>
                  <input type="url" name="cvUrl" id="cvUrl" value={formData.cvUrl} onChange={handleChange} className="hf-input" placeholder="Link to Google Drive, Dropbox, or personal site" />
                  <p className="hf-helper-text">Provide a public link to your current resume.</p>
                </div>
              </div>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="px-6 py-5 bg-gray-50 border-t border-gray-200 rounded-b-lg flex justify-end">
            <button type="submit" disabled={saving} className="hf-btn hf-btn-primary">
              {saving && <Loader2 size={16} className="animate-spin mr-2" />}
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </PageTransition>
  );
}

