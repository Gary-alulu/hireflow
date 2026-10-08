import Link from 'next/link';
import { ArrowRight, Target, Heart, Lightbulb, Globe, Users, TrendingUp, CheckCircle, Star } from 'lucide-react';

export const metadata = {
  title: 'About Us — HireFlow',
  description: 'Learn about HireFlow\'s mission to transform the future of hiring with AI-powered recruitment tools.',
};

const stats = [
  { value: '10,000+', label: 'Jobs Posted' },
  { value: '250K+',  label: 'Candidates Placed' },
  { value: '98%',    label: 'Client Satisfaction' },
  { value: '40+',    label: 'Countries Served' },
];

const values = [
  {
    icon: Target,
    title: 'Precision Over Volume',
    description: 'We believe quality hires come from intelligent matching, not shotgun approaches. Every feature we build sharpens the signal.',
  },
  {
    icon: Heart,
    title: 'Human at Heart',
    description: 'AI accelerates our work but never replaces human judgment. We design for the humans on both sides of every hiring decision.',
  },
  {
    icon: Lightbulb,
    title: 'Relentlessly Curious',
    description: 'We question every hiring convention. If a process can be smarter, faster, or fairer — we build it.',
  },
  {
    icon: Globe,
    title: 'Built for Scale',
    description: 'From startups making their first hire to enterprises managing thousands of roles, HireFlow is built to grow with you.',
  },
];

const team = [
  {
    name: 'Sarah Chen',
    role: 'CEO & Co-Founder',
    bio: 'Former Head of Talent at Stripe. On a mission to make hiring as scientific as it is human.',
    avatar: 'https://i.pravatar.cc/150?u=sarah-chen',
    linkedin: '#',
    twitter: '#',
  },
  {
    name: 'Marcus Reid',
    role: 'CTO & Co-Founder',
    bio: '15 years in ML infrastructure. Built candidate matching systems at LinkedIn and Indeed.',
    avatar: 'https://i.pravatar.cc/150?u=marcus-reid',
    linkedin: '#',
    twitter: '#',
  },
  {
    name: 'Aisha Okonkwo',
    role: 'Head of Product',
    bio: 'Product lead from Google for Jobs and Workday. Obsessed with reducing time-to-hire.',
    avatar: 'https://i.pravatar.cc/150?u=aisha-okonkwo',
    linkedin: '#',
    twitter: '#',
  },
  {
    name: 'Dmitri Volkov',
    role: 'Head of AI Research',
    bio: 'PhD in NLP from CMU. Leads the AI that powers our candidate matching and scoring engine.',
    avatar: 'https://i.pravatar.cc/150?u=dmitri-volkov',
    linkedin: '#',
    twitter: '#',
  },
];

const milestones = [
  { year: '2021', event: 'HireFlow founded in San Francisco by Sarah Chen and Marcus Reid.' },
  { year: '2022', event: 'First 1,000 companies onboarded. Raised $8M Seed from Sequoia.' },
  { year: '2023', event: 'Launched AI Match Scoring — 3× faster shortlisting for enterprise clients.' },
  { year: '2024', event: 'Expanded to 40+ countries. 250,000+ successful placements globally.' },
  { year: '2025', event: 'Raised $45M Series B. Launched HireFlow Insights analytics suite.' },
  { year: '2026', event: 'Today — powering the future of hiring for 10,000+ companies worldwide.' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--gray-50)' }}>

      {/* Navigation — consistent with homepage */}
      <nav className="max-w-[1400px] mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--brand-600)' }}>
            <div className="w-3.5 h-3.5 rounded-full bg-white/30 border-2 border-white"></div>
          </div>
          <span className="text-xl font-bold tracking-tight" style={{ color: 'var(--brand-900)' }}>HireFlow</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium" style={{ color: 'var(--brand-900)' }}>
          <Link href="/jobs" className="hover:opacity-70 transition-opacity">Find a Job</Link>
          <Link href="/about" className="font-semibold transition-opacity" style={{ color: 'var(--brand-600)' }}>About Us</Link>
          <Link href="/services" className="hover:opacity-70 transition-opacity">Services</Link>
          <Link href="#" className="hover:opacity-70 transition-opacity">Case Studies</Link>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login" className="hidden sm:block text-sm font-medium hover:opacity-70" style={{ color: 'var(--brand-900)' }}>
            Sign In
          </Link>
          <Link href="/register" className="px-5 py-2.5 rounded-full text-sm font-medium text-white transition-transform hover:scale-105" style={{ backgroundColor: 'var(--brand-600)' }}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 mt-4 mb-20">
        <div
          className="relative overflow-hidden rounded-[40px] p-10 md:p-16 lg:p-24 text-white"
          style={{ background: 'linear-gradient(135deg, var(--brand-700) 0%, var(--brand-900) 100%)' }}
        >
          {/* Background image overlay */}
          <img
            src="/images/about-hero.jpg"
            alt="Team"
            className="absolute inset-0 w-full h-full object-cover opacity-10"
          />
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-medium mb-8">
              <Star size={13} /> Our Story
            </div>
            <h1 className="text-5xl md:text-7xl font-semibold leading-[1.1] tracking-tight mb-6">
              Hiring that works <span style={{ color: 'var(--brand-100)' }}>for everyone</span>
            </h1>
            <p className="text-white/80 text-xl max-w-xl leading-relaxed">
              We started HireFlow because hiring was broken — slow, biased, and expensive. We built the platform we wished existed.
            </p>
          </div>
          {/* Decorative orb */}
          <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ backgroundColor: 'var(--brand-100)' }}></div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-[1200px] mx-auto px-6 mb-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-3xl p-8 text-center shadow-sm border border-gray-100">
              <p className="text-4xl font-bold tracking-tight mb-2" style={{ color: 'var(--brand-600)' }}>{stat.value}</p>
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-[1200px] mx-auto px-6 mb-24">
        <div className="bg-white rounded-[40px] p-10 md:p-16 flex flex-col lg:flex-row gap-12 items-center shadow-sm border border-gray-100">
          <div className="flex-1">
            <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-6" style={{ backgroundColor: 'var(--brand-50)', color: 'var(--brand-700)' }}>
              Our Mission
            </div>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight leading-tight mb-6" style={{ color: 'var(--gray-900)' }}>
              Make every hire a <span style={{ color: 'var(--brand-600)' }}>great hire</span>
            </h2>
            <p className="text-lg leading-relaxed mb-8" style={{ color: 'var(--color-text-secondary)' }}>
              HireFlow exists to eliminate the guesswork from hiring. By combining intelligent AI with a seamless candidate experience, we help companies build stronger teams — faster, more fairly, and with confidence.
            </p>
            <div className="space-y-3">
              {['AI-powered precision, not keyword spam', 'Transparent candidate scoring', 'Built for speed without sacrificing quality'].map(point => (
                <div key={point} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 flex-shrink-0" style={{ color: 'var(--brand-600)' }} />
                  <span className="text-base font-medium" style={{ color: 'var(--gray-800)' }}>{point}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-4">
            {[
              { icon: TrendingUp, label: 'Faster Hiring', sub: '3× faster than industry average' },
              { icon: Target,     label: 'Precise Matching', sub: 'AI scores every applicant' },
              { icon: Users,      label: 'Global Network', sub: '250K+ professionals placed' },
              { icon: Globe,      label: 'Worldwide Reach', sub: 'Active in 40+ countries' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="rounded-3xl p-6" style={{ backgroundColor: 'var(--brand-50)' }}>
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-3" style={{ backgroundColor: 'var(--brand-100)' }}>
                  <Icon size={20} style={{ color: 'var(--brand-700)' }} />
                </div>
                <p className="font-semibold mb-1" style={{ color: 'var(--gray-900)' }}>{label}</p>
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-[1200px] mx-auto px-6 mb-24">
        <div className="text-center mb-12">
          <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4" style={{ backgroundColor: 'var(--brand-50)', color: 'var(--brand-700)' }}>
            What We Stand For
          </div>
          <h2 className="text-4xl font-semibold tracking-tight" style={{ color: 'var(--gray-900)' }}>Our core values</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {values.map(({ icon: Icon, title, description }) => (
            <div key={title} className="bg-white rounded-3xl p-8 flex gap-6 shadow-sm border border-gray-100 group hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform" style={{ backgroundColor: 'var(--brand-50)' }}>
                <Icon size={22} style={{ color: 'var(--brand-700)' }} />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--gray-900)' }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="max-w-[1200px] mx-auto px-6 mb-24">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-semibold tracking-tight" style={{ color: 'var(--gray-900)' }}>Our journey</h2>
        </div>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px" style={{ backgroundColor: 'var(--brand-100)' }}></div>
          <div className="space-y-10">
            {milestones.map((m, i) => (
              <div key={m.year} className={`relative flex items-start gap-8 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                {/* Dot */}
                <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-4 border-white z-10 flex-shrink-0 mt-1" style={{ backgroundColor: 'var(--brand-600)' }}></div>
                {/* Content */}
                <div className={`ml-14 md:ml-0 md:w-1/2 ${i % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 inline-block w-full">
                    <span className="inline-block text-xs font-bold rounded-full px-3 py-1 mb-3" style={{ backgroundColor: 'var(--brand-600)', color: 'white' }}>{m.year}</span>
                    <p className="text-sm leading-relaxed font-medium" style={{ color: 'var(--gray-700)' }}>{m.event}</p>
                  </div>
                </div>
                <div className="hidden md:block md:w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="max-w-[1200px] mx-auto px-6 mb-24">
        <div className="text-center mb-12">
          <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4" style={{ backgroundColor: 'var(--brand-50)', color: 'var(--brand-700)' }}>
            The Team
          </div>
          <h2 className="text-4xl font-semibold tracking-tight mb-4" style={{ color: 'var(--gray-900)' }}>Built by people who get hiring</h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
            We come from the world's best hiring platforms — and we're here to do it better.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((member) => (
            <div key={member.name} className="bg-white rounded-3xl p-6 text-center shadow-sm border border-gray-100 group hover:shadow-md transition-shadow">
              <img
                src={member.avatar}
                alt={member.name}
                className="w-20 h-20 rounded-full mx-auto mb-4 object-cover ring-4 group-hover:ring-8 transition-all"
                style={{ ringColor: 'var(--brand-100)' }}
              />
              <h3 className="font-semibold mb-1" style={{ color: 'var(--gray-900)' }}>{member.name}</h3>
              <p className="text-xs font-medium mb-3" style={{ color: 'var(--brand-600)' }}>{member.role}</p>
              <p className="text-xs leading-relaxed mb-5" style={{ color: 'var(--color-text-secondary)' }}>{member.bio}</p>
              <div className="flex justify-center gap-3">
                <a href={member.linkedin} className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-blue-50" style={{ backgroundColor: 'var(--gray-100)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gray-600)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                </a>
                <a href={member.twitter} className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-sky-50" style={{ backgroundColor: 'var(--gray-100)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gray-600)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-[1400px] mx-auto px-6 pb-24">
        <div className="rounded-[40px] p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 text-white" style={{ background: 'linear-gradient(135deg, var(--brand-700) 0%, var(--brand-900) 100%)' }}>
          <div>
            <h2 className="text-3xl md:text-4xl font-semibold mb-3">Join us on the mission</h2>
            <p className="text-white/80 text-lg">Start building your dream team — or find your next opportunity.</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link href="/register?role=recruiter" className="px-8 py-4 rounded-full font-semibold text-sm transition-transform hover:scale-105" style={{ backgroundColor: 'var(--brand-100)', color: 'var(--brand-900)' }}>
              I'm Hiring
            </Link>
            <Link href="/register?role=candidate" className="px-8 py-4 rounded-full font-semibold text-sm border border-white/30 text-white hover:bg-white/10 transition-colors">
              I'm Job Hunting
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}