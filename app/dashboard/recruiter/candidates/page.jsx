'use client';

import { useState, useEffect } from 'react';
import { Search, MapPin, Briefcase, Mail, User } from 'lucide-react';
import Link from 'next/link';
import PageTransition from '@/components/PageTransition';

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async (searchQuery = '') => {
    setLoading(true);
    try {
      const url = searchQuery ? `/api/candidates?search=${encodeURIComponent(searchQuery)}` : '/api/candidates';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setCandidates(data.candidates);
      }
    } catch (error) {
      console.error('Failed to fetch candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCandidates(search);
  };

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-h2" style={{ color: 'var(--gray-900)' }}>Candidate Network</h1>
            <p className="text-body mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              Search and proactively source candidates for your roles.
            </p>
          </div>
        
          <form onSubmit={handleSearch} className="flex items-center w-full md:max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              placeholder="Search by name, title, or skill..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="hf-input pl-9"
            />
            <button type="submit" className="absolute right-1 top-1 hf-btn hf-btn-primary hf-btn-sm" style={{ height: '28px' }}>
              Search
            </button>
          </form>
        </div>
      
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="hf-card p-6 h-64 hf-skeleton"></div>
            ))}
          </div>
        ) : candidates.length === 0 ? (
          <div className="hf-empty hf-card">
            <Search className="mx-auto h-12 w-12" style={{ color: 'var(--gray-400)' }} />
            <h3 className="text-h4 mt-4" style={{ color: 'var(--gray-900)' }}>No candidates found</h3>
            <p className="text-body mt-2" style={{ color: 'var(--color-text-secondary)' }}>
              Try adjusting your search criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {candidates.map((profile) => (
              <div key={profile._id} className="hf-card flex flex-col p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4 mb-4">
                  <div className="h-12 w-12 rounded-full overflow-hidden flex-shrink-0" style={{ backgroundColor: 'var(--brand-100)' }}>
                    {profile.profilePhoto ? (
                      <img src={profile.profilePhoto} alt={profile.userId?.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <User className="h-6 w-6" style={{ color: 'var(--brand-700)' }} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-h4 truncate" style={{ color: 'var(--gray-900)' }}>{profile.userId?.name || 'Unknown Candidate'}</h3>
                    <p className="text-body-sm truncate" style={{ color: 'var(--brand-600)' }}>
                      {profile.experience?.[0]?.title || 'Professional'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mb-4 text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5" />
                    <span className="truncate">{profile.location || 'Location not specified'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5" />
                    <span className="truncate">{profile.userId?.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-3.5 w-3.5" />
                    <span className="truncate">{profile.experience?.length || 0} past roles</span>
                  </div>
                </div>

                {profile.skills && profile.skills.length > 0 && (
                  <div className="mb-6 flex-1">
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {profile.skills.slice(0, 4).map((skill, idx) => (
                        <span key={idx} className="hf-badge" style={{ backgroundColor: 'var(--gray-100)', color: 'var(--gray-700)' }}>
                          {skill}
                        </span>
                      ))}
                      {profile.skills.length > 4 && (
                        <span className="hf-badge" style={{ backgroundColor: 'var(--gray-50)', color: 'var(--gray-500)' }}>
                          +{profile.skills.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-auto pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                  <button 
                    className="hf-btn hf-btn-secondary w-full"
                    onClick={() => alert('View Full Profile coming in next iteration!')}
                  >
                    View Full Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}

