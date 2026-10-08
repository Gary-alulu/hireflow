'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import PageTransition from '@/components/PageTransition';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'candidate',
    companyName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      if (data.role === 'recruiter') {
        router.push('/dashboard/recruiter');
      } else {
        router.push('/dashboard/candidate');
      }
      
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div>
        <div className="text-center mb-8">
          <h2 className="text-h2" style={{ color: 'var(--gray-900)' }}>Create an account</h2>
          <p className="text-body mt-2" style={{ color: 'var(--color-text-secondary)' }}>
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-700">
              Sign in
            </Link>
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className="hf-alert hf-alert-error">
              {error}
            </div>
          )}
        
          <div className="hf-field">
            <label htmlFor="name" className="hf-label">Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              className="hf-input"
              placeholder="John Doe"
              disabled={loading}
            />
          </div>

          <div className="hf-field">
            <label htmlFor="email" className="hf-label">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="hf-input"
              placeholder="you@example.com"
              disabled={loading}
            />
          </div>

          <div className="hf-field">
            <label htmlFor="password" className="hf-label">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="hf-input"
              placeholder="Create a strong password"
              disabled={loading}
            />
          </div>

          <div className="hf-field">
            <label htmlFor="role" className="hf-label">I am a...</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="hf-select"
              disabled={loading}
            >
              <option value="candidate">Candidate (Looking for jobs)</option>
              <option value="recruiter">Recruiter (Hiring)</option>
            </select>
          </div>

          {formData.role === 'recruiter' && (
            <div className="hf-field">
              <label htmlFor="companyName" className="hf-label">Company Name</label>
              <input
                id="companyName"
                name="companyName"
                type="text"
                required={formData.role === 'recruiter'}
                value={formData.companyName}
                onChange={handleChange}
                className="hf-input"
                placeholder="Acme Corp"
                disabled={loading}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="hf-btn hf-btn-primary w-full h-11 text-base mt-2"
          >
            {loading && <Loader2 className="animate-spin mr-2" size={18} />}
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
      </div>
    </PageTransition>
  );
}

