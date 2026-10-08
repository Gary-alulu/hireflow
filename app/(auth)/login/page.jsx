'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import PageTransition from '@/components/PageTransition';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
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
        <h2 className="text-h2" style={{ color: 'var(--gray-900)' }}>Sign in to your account</h2>
        <p className="text-body mt-2" style={{ color: 'var(--color-text-secondary)' }}>
          Don't have an account?{' '}
          <Link href="/register" transitionTypes={['nav-forward']} className="font-medium text-blue-600 hover:text-blue-700">
            Create one
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
          <label htmlFor="email" className="hf-label">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="hf-input"
            placeholder="••••••••"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="hf-btn hf-btn-primary w-full h-11 text-base mt-2"
        >
          {loading && <Loader2 className="animate-spin mr-2" size={18} />}
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
      </div>
    </PageTransition>
  );
}
