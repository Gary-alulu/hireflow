'use client';

import { useState, useEffect } from 'react';
import { Calendar, Video, MapPin, Phone, Clock } from 'lucide-react';
import PageTransition from '@/components/PageTransition';

export default function CandidateInterviewsPage() {
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
      <div className="space-y-6 max-w-5xl mx-auto">
        <h1 className="text-h2" style={{ color: 'var(--gray-900)' }}>Upcoming Interviews</h1>

        {loading ? (
          <div className="text-center py-10" style={{ color: 'var(--color-text-secondary)' }}>Loading interviews...</div>
        ) : interviews.length === 0 ? (
          <div className="hf-empty hf-card">
            <Calendar className="mx-auto h-12 w-12" style={{ color: 'var(--gray-400)' }} />
            <h3 className="text-h4 mt-4" style={{ color: 'var(--gray-900)' }}>No upcoming interviews</h3>
            <p className="text-body mt-2" style={{ color: 'var(--color-text-secondary)' }}>Keep applying to jobs to secure interviews!</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {interviews.map((interview) => (
              <div key={interview._id} className="hf-card p-6 border-t-4" style={{ borderTopColor: 'var(--brand-500)' }}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-h4" style={{ color: 'var(--gray-900)' }}>{interview.jobId?.title}</h3>
                    <p className="text-body-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>Interviewer: {interview.recruiterId?.name}</p>
                  </div>
                  <span className="hf-badge" style={{ backgroundColor: 'var(--brand-50)', color: 'var(--brand-700)' }}>
                    {interview.status}
                  </span>
                </div>
              
                <div className="mt-6 space-y-3 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="flex items-center text-body-sm" style={{ color: 'var(--gray-700)' }}>
                    <Clock className="h-4 w-4 mr-3" style={{ color: 'var(--gray-400)' }} />
                    {new Date(interview.scheduledDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </div>
                  <div className="flex items-center text-body-sm" style={{ color: 'var(--gray-700)' }}>
                    {getIcon(interview.interviewType)}
                    <span className="ml-3">{interview.interviewType} Interview</span>
                  </div>
                  <div className="flex items-center text-body-sm p-3 rounded-md mt-2" style={{ backgroundColor: 'var(--brand-50)', color: 'var(--brand-700)' }}>
                    <span className="break-all font-medium">{interview.locationOrLink}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}

