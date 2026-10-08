'use client';

import { useState, useEffect } from 'react';
import { Save, Building2, User } from 'lucide-react';
import PageTransition from '@/components/PageTransition';

export default function SettingsPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    companyName: '',
    website: '',
    industry: '',
    size: '',
    location: '',
    description: ''
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
            industry: data.company?.industry || '',
            size: data.company?.size || '',
            location: data.company?.location || '',
            description: data.company?.description || ''
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
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
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
                <select name="size" value={formData.size} onChange={handleChange} className="hf-select">
                  <option value="">Select size...</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="500+">500+ employees</option>
                </select>
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

          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="hf-btn hf-btn-primary hf-btn-lg px-8">
              {saving ? 'Saving...' : <><Save className="h-4 w-4 mr-2" /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>
    </PageTransition>
  );
}
