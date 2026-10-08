'use client';

import { useState, useEffect } from 'react';
import { Calendar, Video, MapPin, Phone, Clock, User } from 'lucide-react';
import PageTransition from '@/components/PageTransition';

export default function RecruiterInterviewsPage() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInterviews() {
      try {
        const res = await fetch('/api/interviews');
        if (res.ok) {
          const data = await res.json();
          setInterviews(data.interviews);
        }
      } catch (error) {
        console.error('Failed to fetch interviews', error);
      } finally {
        setLoading(false);
      }
    }
    fetchInterviews();
  }, []);

  const getIcon = (type) => {
    switch(type) {
      case 'Video': return <Video className="h-5 w-5 text-gray-400" />;
      case 'Phone': return <Phone className="h-5 w-5 text-gray-400" />;
      default: return <MapPin className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <PageTransition key={loading ? 'loading' : 'ready'}>
      <div className="space-y-6 max-w-6xl mx-auto">
        <h1 className="text-h2" style={{ color: 'var(--gray-900)' }}>Interview Schedule</h1>

        {loading ? (
          <div className="text-center py-10" style={{ color: 'var(--color-text-secondary)' }}>Loading interviews...</div>
        ) : interviews.length === 0 ? (
          <div className="hf-empty hf-card">
            <Calendar className="mx-auto h-12 w-12" style={{ color: 'var(--gray-400)' }} />
            <h3 className="text-h4 mt-4" style={{ color: 'var(--gray-900)' }}>No interviews scheduled</h3>
            <p className="text-body mt-2" style={{ color: 'var(--color-text-secondary)' }}>Go to a job's applicant list to schedule interviews.</p>
          </div>
        ) : (
          <div className="hf-card overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {interviews.map((interview) => (
                <li key={interview._id}>
                  <div className="px-5 py-5 sm:px-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--brand-50)' }}>
                            <User className="h-5 w-5" style={{ color: 'var(--brand-600)' }} />
                          </div>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-h4" style={{ color: 'var(--brand-600)' }}>{interview.candidateId?.name}</h3>
                          <p className="text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>Applying for: {interview.jobId?.title}</p>
                        </div>
                      </div>
                      <div>
                        <span className="hf-badge hf-badge-active">
                          {interview.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-4 sm:flex sm:justify-between pt-3 border-t border-dashed" style={{ borderColor: 'var(--color-border)' }}>
                      <div className="sm:flex sm:space-x-6 text-body-sm" style={{ color: 'var(--gray-700)' }}>
                        <p className="flex items-center">
                          <Clock className="flex-shrink-0 mr-1.5 h-4 w-4" style={{ color: 'var(--gray-400)' }} />
                          {new Date(interview.scheduledDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                        </p>
                        <p className="mt-2 sm:mt-0 flex items-center">
                          {getIcon(interview.interviewType)}
                          <span className="ml-1.5">{interview.interviewType}</span>
                        </p>
                      </div>
                      <div className="mt-2 sm:mt-0 flex items-center text-body-sm font-medium" style={{ color: 'var(--brand-600)' }}>
                        Link/Location: {interview.locationOrLink}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
