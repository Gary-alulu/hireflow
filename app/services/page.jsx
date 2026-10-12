import Link from 'next/link';
import { CheckCircle, ArrowRight, BrainCircuit, FileSearch, Calendar, BarChart3, Users, Shield, Zap, MessageSquare } from 'lucide-react';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Services — HireFlow',
  description: 'Explore HireFlow\'s full suite of AI-powered hiring tools — from job posting and candidate matching to analytics and interview scheduling.',
};

const plans = [
  {
    name: 'Starter',
    price: '$49',
    period: '/month',
    description: 'Perfect for small teams making their first strategic hires.',
    highlight: false,
    features: [
      'Up to 5 active job postings',
      'AI Candidate Match Scoring',
      'Basic applicant pipeline',
      'Interview Scheduler',
      'Email support',
    ],
    cta: 'Start Free Trial',
    href: '/register?role=recruiter&plan=starter',
  },
  {
    name: 'Growth',
    price: '$149',
    period: '/month',
    description: 'For growing companies with active, ongoing hiring needs.',
    highlight: true,
    features: [
      'Unlimited job postings',
      'Advanced AI Match Scoring',
      'Full hiring pipeline (8 stages)',
      'Analytics Dashboard',
      'Candidate Sourcing Network',
      'Priority email & chat support',
    ],
    cta: 'Get Growth Plan',
    href: '/register?role=recruiter&plan=growth',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'pricing',
    description: 'Tailored solutions for large teams with complex hiring workflows.',
    highlight: false,
    features: [
      'Everything in Growth',
      'Multi-user team access',
      'Custom AI model tuning',
      'Dedicated account manager',
      'SSO & advanced security',
      'SLA guarantee (99.9% uptime)',
    ],
    cta: 'Contact Sales',
    href: '/register?role=recruiter&plan=enterprise',
  },
];

const services = [
  {
    icon: BrainCircuit,
    title: 'AI Candidate Matching',
    description: 'Our AI evaluates every applicant against your job requirements in seconds — scoring skills, experience, and cultural signals. Reduce your shortlisting time by 3×.',
    bullets: ['Skills-based matching engine', 'AI reasoning transparency', 'Continuously learns from outcomes'],
  },
  {
    icon: FileSearch,
    title: 'Smart Job Posting',
    description: 'Generate compelling, bias-reduced job descriptions with AI. Publish to your careers page instantly and distribute across major job boards.',
    bullets: ['AI-generated JD drafts', 'One-click multi-platform publish', 'SEO-optimized listings'],
  },
  {
    icon: Calendar,
    title: 'Interview Scheduling',
    description: 'Eliminate the back-and-forth. Candidates self-schedule from real-time availability, with automatic confirmations and reminders for everyone involved.',
    bullets: ['Candidate self-scheduling', 'Calendar sync (Google, Outlook)', 'Automatic reminders & follow-ups'],
  },
  {
    icon: BarChart3,
    title: 'Hiring Analytics',
    description: 'Get a real-time view of your entire funnel. Understand where candidates drop off, track time-to-hire, and benchmark against your historical performance.',
    bullets: ['Pipeline conversion charts', 'Time-to-hire tracking', 'Source performance analysis'],
  },
  {
    icon: Users,
    title: 'Candidate Network',
    description: 'Stop waiting for applications. Browse HireFlow\'s growing talent network and proactively source candidates by skill, title, or location.',
    bullets: ['Searchable talent pool', 'Filter by skills & experience', 'Direct candidate messaging'],
  },
  {
    icon: Shield,
    title: 'Compliance & Security',
    description: 'Enterprise-grade data security, GDPR-ready workflows, and tools to help you build more equitable, bias-aware hiring processes.',
    bullets: ['GDPR compliant data handling', 'Role-based access controls', 'Audit logs & activity tracking'],
  },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--gray-50)' }}>

      {/* Navigation */}
      <nav className="max-w-[1400px] mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <img src="/images/hireflow-logo.png" alt="HireFlow" className="h-8 w-8 rounded-full bg-white object-contain flex-shrink-0" />
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium" style={{ color: 'var(--brand-900)' }}>
          <Link href="/jobs" className="hover:opacity-70 transition-opacity">Find a Job</Link>
          <Link href="/about" className="hover:opacity-70 transition-opacity">About Us</Link>
          <Link href="/services" className="font-semibold transition-opacity" style={{ color: 'var(--brand-600)' }}>Services</Link>
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
        <div className="rounded-[40px] p-10 md:p-20 text-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--brand-700) 0%, var(--brand-900) 100%)' }}>
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 30% 40%, white 1px, transparent 1px), radial-gradient(circle at 70% 70%, white 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>
          <div className="relative z-10 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-medium text-white mb-8">
              <Zap size={13} /> Everything you need to hire better
            </div>
            <h1 className="text-5xl md:text-7xl font-semibold text-white leading-[1.1] tracking-tight mb-6">
              One platform. <span style={{ color: 'var(--brand-100)' }}>Every hire.</span>
            </h1>
            <p className="text-white/80 text-xl leading-relaxed mb-10 max-w-xl mx-auto">
              From your first job posting to your thousandth successful hire — HireFlow's AI-powered suite covers every step.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="px-8 py-4 rounded-full font-semibold text-base transition-transform hover:scale-105" style={{ backgroundColor: 'var(--brand-100)', color: 'var(--brand-900)' }}>
                Start for Free <ArrowRight size={16} className="inline ml-1" />
              </Link>
              <Link href="#pricing" className="px-8 py-4 rounded-full font-semibold text-base border border-white/30 text-white hover:bg-white/10 transition-colors">
                See Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="max-w-[1200px] mx-auto px-6 mb-24">
        <div className="text-center mb-12">
          <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4" style={{ backgroundColor: 'var(--brand-50)', color: 'var(--brand-700)' }}>
            What We Offer
          </div>
          <h2 className="text-4xl font-semibold tracking-tight mb-4" style={{ color: 'var(--gray-900)' }}>A full hiring OS — not just an ATS</h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
            Every tool is designed around a single goal: get the right person in the right seat, faster.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(({ icon: Icon, title, description, bullets }) => (
            <div key={title} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 group hover:shadow-md transition-shadow flex flex-col">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform" style={{ backgroundColor: 'var(--brand-50)' }}>
                <Icon size={28} style={{ color: 'var(--brand-700)' }} />
              </div>
              <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--gray-900)' }}>{title}</h3>
              <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--color-text-secondary)' }}>{description}</p>
              <ul className="space-y-2 mt-auto">
                {bullets.map(b => (
                  <li key={b} className="flex items-start gap-2 text-sm" style={{ color: 'var(--gray-700)' }}>
                    <CheckCircle size={15} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--brand-600)' }} />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-[1200px] mx-auto px-6 mb-24">
        <div className="bg-white rounded-[40px] p-10 md:p-16 shadow-sm border border-gray-100">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-semibold tracking-tight mb-4" style={{ color: 'var(--gray-900)' }}>From post to placement in 4 steps</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-px" style={{ backgroundColor: 'var(--brand-100)' }}></div>

            {[
              { num: '01', title: 'Post Your Job', desc: 'Create a detailed job listing in minutes — AI fills in the gaps.' },
              { num: '02', title: 'Candidates Apply', desc: 'Applicants flow in; AI instantly scores and ranks each one.' },
              { num: '03', title: 'Shortlist & Interview', desc: 'Review the top matches and schedule interviews in one click.' },
              { num: '04', title: 'Make the Hire', desc: 'Move your chosen candidate to Offer and track through onboarding.' },
            ].map((step) => (
              <div key={step.num} className="text-center relative z-10">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg" style={{ backgroundColor: 'var(--brand-600)', color: 'white' }}>
                  {step.num}
                </div>
                <h3 className="font-semibold mb-2" style={{ color: 'var(--gray-900)' }}>{step.title}</h3>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-[1200px] mx-auto px-6 mb-24">
        <div className="text-center mb-12">
          <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4" style={{ backgroundColor: 'var(--brand-50)', color: 'var(--brand-700)' }}>
            Pricing
          </div>
          <h2 className="text-4xl font-semibold tracking-tight mb-4" style={{ color: 'var(--gray-900)' }}>Transparent. Simple. Scalable.</h2>
          <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>No hidden fees. Cancel anytime.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-3xl p-8 border transition-shadow hover:shadow-lg ${plan.highlight ? 'text-white relative overflow-hidden shadow-xl' : 'bg-white border-gray-100 shadow-sm'}`}
              style={plan.highlight ? { background: 'linear-gradient(135deg, var(--brand-600) 0%, var(--brand-800, var(--brand-900)) 100%)', borderColor: 'transparent' } : {}}
            >
              {plan.highlight && (
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: 'var(--brand-100)', color: 'var(--brand-900)' }}>
                  Most Popular
                </div>
              )}
              <p className="text-sm font-semibold mb-2" style={{ color: plan.highlight ? 'rgba(255,255,255,0.7)' : 'var(--brand-600)' }}>{plan.name}</p>
              <div className="flex items-end gap-1 mb-3">
                <span className="text-5xl font-bold" style={{ color: plan.highlight ? 'white' : 'var(--gray-900)' }}>{plan.price}</span>
                <span className="text-sm mb-2" style={{ color: plan.highlight ? 'rgba(255,255,255,0.6)' : 'var(--color-text-secondary)' }}>{plan.period}</span>
              </div>
              <p className="text-sm mb-8" style={{ color: plan.highlight ? 'rgba(255,255,255,0.7)' : 'var(--color-text-secondary)' }}>{plan.description}</p>

              <ul className="space-y-3 mb-8">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <CheckCircle size={16} className="flex-shrink-0 mt-0.5" style={{ color: plan.highlight ? 'var(--brand-100)' : 'var(--brand-600)' }} />
                    <span style={{ color: plan.highlight ? 'white' : 'var(--gray-700)' }}>{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className="block w-full text-center py-3.5 rounded-full font-semibold text-sm transition-transform hover:scale-105"
                style={plan.highlight
                  ? { backgroundColor: 'var(--brand-100)', color: 'var(--brand-900)' }
                  : { backgroundColor: 'var(--brand-600)', color: 'white' }
                }
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ / Contact */}
      <section className="max-w-[1200px] mx-auto px-6 mb-24">
        <div className="rounded-[40px] p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8" style={{ backgroundColor: 'var(--brand-50)' }}>
          <div>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: 'var(--brand-100)' }}>
              <MessageSquare size={28} style={{ color: 'var(--brand-700)' }} />
            </div>
            <h2 className="text-3xl font-semibold mb-3" style={{ color: 'var(--gray-900)' }}>Still have questions?</h2>
            <p className="text-lg max-w-md" style={{ color: 'var(--color-text-secondary)' }}>
              Our team is happy to walk you through the platform, answer pricing questions, or set up a personalised demo.
            </p>
          </div>
          <div className="flex flex-col gap-4 w-full md:w-auto">
            <Link href="/register" className="px-10 py-4 rounded-full font-semibold text-sm text-white text-center transition-transform hover:scale-105" style={{ backgroundColor: 'var(--brand-600)' }}>
              Book a Demo
            </Link>
            <Link href="/login" className="px-10 py-4 rounded-full font-semibold text-sm text-center border transition-colors hover:bg-white" style={{ borderColor: 'var(--brand-200)', color: 'var(--brand-700)' }}>
              Sign in to Existing Account
            </Link>
          </div>
        </div>
      </section>

      <Footer />

    </div>
  );
}