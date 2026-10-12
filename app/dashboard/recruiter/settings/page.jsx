'use client';

import { useState, useEffect } from 'react';
import { Save, Building2, User, Globe, Share2 } from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import AccountDangerZone from '@/components/AccountDangerZone';
import Select from '@/components/ui/Select';

const COMPANY_SIZE_OPTIONS = [
  { value: '', label: 'Select size…' },
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '500+', label: '500+ employees' },
];

export default function SettingsPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    companyName: '',
    website: '',
    logo: '',
    industry: '',
    size: '',
    location: '',
    description: '',
    socialLinkedIn: '',
    socialTwitter: '',
    socialFacebook: '',
    socialInstagram: '',
    socialGithub: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          setFormData({
            name: data.user?.name || '',
            email: data.user?.email || '',
            companyName: data.company?.name || '',
            website: data.company?.website || '',
            logo: data.company?.logo || '',
            industry: data.company?.industry || '',
            size: data.company?.size || '',
            location: data.company?.location || '',
            description: data.company?.description || '',
            socialLinkedIn: data.company?.socialLinks?.linkedIn || '',
            socialTwitter: data.company?.socialLinks?.twitter || '',
            socialFacebook: data.company?.socialLinks?.facebook || '',
            socialInstagram: data.company?.socialLinks?.instagram || '',
            socialGithub: data.company?.socialLinks?.github || '',
          });
        }
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    
    try {
      const payload = {
        name: formData.name,
        companyName: formData.companyName,
        website: formData.website,
        logo: formData.logo,
        industry: formData.industry,
        size: formData.size,
        location: formData.location,
        description: formData.description,
        socialLinks: {
          linkedIn: formData.socialLinkedIn,
          twitter: formData.socialTwitter,
          facebook: formData.socialFacebook,
          instagram: formData.socialInstagram,
          github: formData.socialGithub,
        },
      };
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setMessage('Settings saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to save settings.');
      }
    } catch (err) {
      console.error('Error saving settings', err);
      setMessage('An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageTransition key={loading ? 'loading' : 'ready'}>
        <div className="text-center py-10" style={{ color: 'var(--color-text-secondary)' }}>Loading settings...</div>
      </PageTransition>
    );
  }

  return (
    <PageTransition key={loading ? 'loading' : 'ready'}>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-h2" style={{ color: 'var(--gray-900)' }}>Settings</h1>
          <p className="text-body mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            Manage your personal profile and company details.
          </p>
        </div>

        {message && (
          <div className={`hf-alert ${message.includes('success') ? 'hf-alert-success' : 'hf-alert-error'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Personal Details */}
          <div className="hf-card p-6 md:p-8">
            <div className="flex items-center gap-2 mb-6">
              <User className="h-5 w-5" style={{ color: 'var(--brand-600)' }} />
              <h2 className="text-h3" style={{ color: 'var(--gray-900)' }}>Personal Details</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="hf-field">
                <label className="hf-label">Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="hf-input" required />
              </div>
              <div className="hf-field">
                <label className="hf-label">Email Address</label>
                <input type="email" name="email" value={formData.email} className="hf-input" disabled />
                <p className="hf-helper-text">Email cannot be changed.</p>
              </div>
            </div>
          </div>

          {/* Company Details */}
          <div className="hf-card p-6 md:p-8">
            <div className="flex items-center gap-2 mb-6">
              <Building2 className="h-5 w-5" style={{ color: 'var(--brand-600)' }} />
              <h2 className="text-h3" style={{ color: 'var(--gray-900)' }}>Company Profile</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="hf-field">
                <label className="hf-label">Company Name</label>
                <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} className="hf-input" required />
              </div>
              <div className="hf-field">
                <label className="hf-label">Website</label>
                <input type="url" name="website" value={formData.website} onChange={handleChange} className="hf-input" placeholder="https://..." />
              </div>
              <div className="hf-field">
                <label className="hf-label">Industry</label>
                <input type="text" name="industry" value={formData.industry} onChange={handleChange} className="hf-input" placeholder="e.g. Technology, Healthcare" />
              </div>
              <div className="hf-field">
                <label className="hf-label">Company Size</label>
                <Select
                  value={formData.size}
                  onChange={(value) => setFormData((prev) => ({ ...prev, size: value }))}
                  options={COMPANY_SIZE_OPTIONS}
                  ariaLabel="Company size"
                />
              </div>
              <div className="hf-field">
                <label className="hf-label">Company Logo</label>
                <input type="url" name="logo" value={formData.logo} onChange={handleChange} className="hf-input" placeholder="https://.../logo.png" />
                <p className="hf-helper-text">Direct link to your logo image.</p>
              </div>
              <div className="hf-field md:col-span-2">
                <label className="hf-label">Headquarters Location</label>
                <input type="text" name="location" value={formData.location} onChange={handleChange} className="hf-input" placeholder="e.g. San Francisco, CA" />
              </div>
              <div className="hf-field md:col-span-2">
                <label className="hf-label">Company Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} className="hf-textarea" placeholder="Tell candidates about your company..."></textarea>
              </div>
            </div>
          </div>

          {/* Branding & Social Links */}
          <div className="hf-card p-6 md:p-8">
            <div className="flex items-center gap-2 mb-6">
              <Globe className="h-5 w-5" style={{ color: 'var(--brand-600)' }} />
              <h2 className="text-h3" style={{ color: 'var(--gray-900)' }}>Branding & Social Links</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="hf-field">
                <label className="hf-label">LinkedIn</label>
                <div className="relative">
                  <Share2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="url" name="socialLinkedIn" value={formData.socialLinkedIn} onChange={handleChange} className="hf-input pl-10" placeholder="https://linkedin.com/company/..." />
                </div>
              </div>
              <div className="hf-field">
                <label className="hf-label">Twitter / X</label>
                <div className="relative">
                  <Share2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="url" name="socialTwitter" value={formData.socialTwitter} onChange={handleChange} className="hf-input pl-10" placeholder="https://x.com/..." />
                </div>
              </div>
              <div className="hf-field">
                <label className="hf-label">Facebook</label>
                <div className="relative">
                  <Share2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="url" name="socialFacebook" value={formData.socialFacebook} onChange={handleChange} className="hf-input pl-10" placeholder="https://facebook.com/..." />
                </div>
              </div>
              <div className="hf-field">
                <label className="hf-label">Instagram</label>
                <div className="relative">
                  <Share2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="url" name="socialInstagram" value={formData.socialInstagram} onChange={handleChange} className="hf-input pl-10" placeholder="https://instagram.com/..." />
                </div>
              </div>
              <div className="hf-field">
                <label className="hf-label">GitHub</label>
                <div className="relative">
                  <Share2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="url" name="socialGithub" value={formData.socialGithub} onChange={handleChange} className="hf-input pl-10" placeholder="https://github.com/..." />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="hf-btn hf-btn-primary hf-btn-lg px-8">
              {saving ? 'Saving...' : <><Save className="h-4 w-4 mr-2" /> Save Changes</>}
            </button>
          </div>
        </form>

        <div className="pt-2">
          <AccountDangerZone />
        </div>
      </div>
    </PageTransition>
  );
}
