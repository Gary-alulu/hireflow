import Link from 'next/link';
import {
  ArrowRight, Sparkles, BrainCircuit, ClipboardList,
  ShieldCheck, Workflow, UserPlus, Briefcase, Search,
  Send, Gauge, Users, CalendarCheck2, BadgeCheck, Inbox,
  Zap, TrendingUp, Globe2,
} from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import Footer from '@/components/Footer';

/* ─── Data ───────────────────────────────────────────────── */

const RECRUITER_LOOP = [
  { icon: UserPlus,      label: 'Create Job',          desc: 'Define role & requirements' },
  { icon: Send,          label: 'Publish',              desc: 'Go live instantly' },
  { icon: InboxIcon,     label: 'Receive Applications', desc: 'Centralised inbox' },
  { icon: Gauge,         label: 'AI Match',             desc: 'Scored automatically' },
  { icon: Users,         label: 'Review & Shortlist',   desc: 'Signal, not spam' },
  { icon: CalendarCheck2,label: 'Interview',            desc: 'Coordinated & tracked' },
  { icon: BadgeCheck,    label: 'Offer',                desc: 'Deliver in-platform' },
  { icon: Sparkles,      label: 'Hire',                 desc: 'Close the loop' },
];

const CANDIDATE_LOOP = [
  { icon: UserPlus,      label: 'Create Profile',       desc: 'One-time setup' },
  { icon: Search,        label: 'Discover Jobs',        desc: 'Tailored to you' },
  { icon: Send,          label: 'Apply',                desc: 'One click, tracked' },
  { icon: ClipboardList, label: 'Track Application',    desc: 'Live stage updates' },
  { icon: CalendarCheck2,label: 'Interview',            desc: 'Notified & prepared' },
  { icon: BadgeCheck,    label: 'Offer',                desc: 'Receive in-platform' },
  { icon: Sparkles,      label: 'Get Hired',            desc: 'Your journey ends here' },
];

const FEATURES = [
  {
    icon: BrainCircuit,
    accent: 'var(--brand-700)',
    accentBg: 'var(--brand-50)',
    title: 'AI Candidate Matching',
    body: 'Every application is scored, explained, and ranked against the role — so reviews start from signal, never from spam.',
  },
  {
    icon: ClipboardList,
    accent: '#4F46E5',
    accentBg: '#EEF2FF',
    title: 'A Pipeline, Not a Pile',
    body: 'Shortlist, interview, offer, and hire from one Kanban board. Candidates see the same stages live.',
  },
  {
    icon: CalendarCheck2,
    accent: '#9333EA',
    accentBg: '#FAF5FF',
    title: 'Real-time Coordination',
    body: 'Schedule interviews, exchange messages, and move to offer — with instant notifications on both sides.',
  },
  {
    icon: ShieldCheck,
    accent: '#0891b2',
    accentBg: '#ecfeff',
    title: 'Private by Design',
    body: 'Recruiter notes stay internal, resumes are access-controlled, and everyone can delete their account at any time.',
  },
];

const STATS = [
  { value: '3×',   label: 'Faster time-to-hire' },
  { value: '94%',  label: 'Candidate satisfaction' },
  { value: '40+',  label: 'Stages automated' },
  { value: '100%', label: 'End-to-end coverage' },
];

/* ─── Sub-components ─────────────────────────────────────── */

function InboxIcon(props) {
  return <Inbox {...props} />;
}

function FeatureCard({ icon: Icon, accent, accentBg, title, body }) {
  return (
    <div className="lp-feature-card">
      <div className="lp-feature-icon" style={{ background: accentBg, color: accent }}>
        <Icon size={22} />
      </div>
      <h3 className="lp-feature-title">{title}</h3>
      <p className="lp-feature-body">{body}</p>
      <div className="lp-feature-glow" style={{ background: accentBg }} />
    </div>
  );
}

function JourneyColumn({ title, subtitle, steps, ctaHref, ctaLabel, variant }) {
  const isDark = variant === 'dark';
  return (
    <div className={`lp-journey-card ${isDark ? 'lp-journey-dark' : 'lp-journey-light'}`}>
      <div className="lp-journey-header">
        <div>
          <h3 className="lp-journey-title">{title}</h3>
          <p className="lp-journey-sub">{subtitle}</p>
        </div>
        <Link
          href={ctaHref}
          className={`lp-journey-cta ${isDark ? 'lp-journey-cta-dark' : 'lp-journey-cta-light'}`}
        >
          {ctaLabel} <ArrowRight size={14} />
        </Link>
      </div>

      <ol className="lp-journey-steps">
        {steps.map(({ icon: Icon, label, desc }, i) => (
          <li key={label} className="lp-journey-step">
            <div className="lp-journey-step-left">
              <span
                className="lp-step-num"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.15)' : 'var(--brand-600)',
                  color: '#fff',
                }}
              >
                {i + 1}
              </span>
              {i < steps.length - 1 && (
                <span className={`lp-step-line ${isDark ? 'lp-step-line-dark' : 'lp-step-line-light'}`} />
              )}
            </div>
            <div className="lp-journey-step-body">
              <div className="lp-step-row">
                <Icon
                  size={15}
                  style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'var(--brand-600)', flexShrink: 0 }}
                />
                <span className="lp-step-label">{label}</span>
              </div>
              <p className="lp-step-desc">{desc}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ─── Metadata ───────────────────────────────────────────── */

export const metadata = {
  title: 'HireFlow — Hire Smarter. Find Better.',
  description:
    'One intelligent workflow for the entire hiring journey — from discovering talent to getting hired.',
};

/* ─── Page ───────────────────────────────────────────────── */

export default function LandingPage() {
  return (
    <PageTransition>
      <div className="lp-root hf-in">

        {/* ── Navbar ────────────────────────────────────── */}
        <header className="lp-nav-wrap">
          <nav className="lp-nav">
            <Link href="/" className="lp-logo">
              <img src="/images/hireflow-logo.png" alt="HireFlow" className="lp-logo-img" />
              <span className="lp-logo-text">HireFlow</span>
            </Link>

            <div className="lp-nav-links">
              <Link href="/jobs"     className="lp-nav-link">Find a Job</Link>
              <Link href="/about"    className="lp-nav-link">About</Link>
              <Link href="/services" className="lp-nav-link">Services</Link>
            </div>

            <div className="lp-nav-actions">
              <Link href="/login"    className="lp-nav-signin">Sign In</Link>
              <Link href="/register" className="lp-nav-cta">
                Get Started <ArrowRight size={14} />
              </Link>
            </div>
          </nav>
        </header>

        {/* ── Hero ──────────────────────────────────────── */}
        <main className="lp-hero-wrap">
          <div className="lp-hero">
            <div className="lp-hero-mesh" aria-hidden="true">
              <div className="lp-mesh-orb lp-mesh-orb-1" />
              <div className="lp-mesh-orb lp-mesh-orb-2" />
              <div className="lp-mesh-orb lp-mesh-orb-3" />
              <div className="lp-mesh-grid" />
            </div>

            <div className="lp-hero-badge">
              <Workflow size={13} />
              <span>One intelligent workflow, end to end</span>
            </div>

            <h1 className="lp-hero-h1">
              Hire Smarter.<br />
              <span className="lp-hero-accent">Find Better.</span>
            </h1>

            <p className="lp-hero-sub">
              HireFlow brings the entire hiring journey — from discovering
              talent to getting hired — into one AI-powered platform.
            </p>

            <div className="lp-hero-actions">
              <Link href="/register" className="lp-btn-hero-primary">
                I&apos;m Hiring <ArrowRight size={16} />
              </Link>
              <Link href="/jobs" className="lp-btn-hero-secondary">
                Find My Next Role <ArrowRight size={16} />
              </Link>
            </div>

            <p className="lp-hero-proof">
              Trusted by forward-thinking teams &amp; ambitious candidates
            </p>
          </div>
        </main>

        {/* ── Stats bar ─────────────────────────────────── */}
        <section className="lp-stats-bar" aria-label="Platform statistics">
          <div className="lp-stats-inner">
            {STATS.map(({ value, label }) => (
              <div key={label} className="lp-stat-item">
                <span className="lp-stat-value">{value}</span>
                <span className="lp-stat-label">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Features ──────────────────────────────────── */}
        <section className="lp-section lp-features-section" aria-labelledby="features-heading">
          <div className="lp-section-inner">
            <div className="lp-section-badge">
              <Zap size={12} />
              <span>How it works</span>
            </div>
            <h2 id="features-heading" className="lp-section-h2">
              Everything you need.<br />Nothing you don&apos;t.
            </h2>
            <p className="lp-section-sub">
              A single platform eliminates tool-switching, broken communication
              and invisible candidate journeys.
            </p>

            <div className="lp-features-grid hf-stagger">
              {FEATURES.map((f) => (
                <FeatureCard key={f.title} {...f} />
              ))}
            </div>
          </div>
        </section>

        {/* ── Journey ───────────────────────────────────── */}
        <section className="lp-section lp-journey-section" aria-labelledby="journey-heading">
          <div className="lp-section-inner">
            <div className="lp-section-badge">
              <TrendingUp size={12} />
              <span>The core loop</span>
            </div>
            <h2 id="journey-heading" className="lp-section-h2">
              Every step. One platform.
            </h2>
            <p className="lp-section-sub">
              Recruiters and candidates share a single intelligent journey —
              nothing falls through the cracks.
            </p>

            <div className="lp-journey-grid">
              <JourneyColumn
                title="For Recruiters"
                subtitle="From posting to hire, guided end to end"
                steps={RECRUITER_LOOP}
                ctaHref="/register"
                ctaLabel="Start hiring"
                variant="dark"
              />
              <JourneyColumn
                title="For Candidates"
                subtitle="Your application, trackable at every stage"
                steps={CANDIDATE_LOOP}
                ctaHref="/jobs"
                ctaLabel="Browse jobs"
                variant="light"
              />
            </div>
          </div>
        </section>

        {/* ── Closing CTA ───────────────────────────────── */}
        <section className="lp-cta-section" aria-label="Call to action">
          <div className="lp-cta-inner">
            <div className="lp-cta-mesh" aria-hidden="true">
              <div className="lp-mesh-orb lp-cta-orb-1" />
              <div className="lp-mesh-orb lp-cta-orb-2" />
            </div>

            <div className="lp-section-badge lp-cta-badge">
              <Globe2 size={12} />
              <span>Get started today</span>
            </div>

            <h2 className="lp-cta-h2">
              Your smarter hire<br />starts here.
            </h2>
            <p className="lp-cta-sub">
              Join the recruiters and candidates running the whole journey
              through HireFlow.
            </p>

            <div className="lp-cta-actions">
              <Link href="/register" className="lp-btn-cta-primary">
                Get Started Now <ArrowRight size={16} />
              </Link>
              <Link href="/jobs" className="lp-btn-cta-secondary">
                <Briefcase size={16} /> Browse Open Roles
              </Link>
            </div>
          </div>
        </section>

        {/* ── Footer ────────────────────────────────────── */}
        <Footer />

      </div>
    </PageTransition>
  );
}