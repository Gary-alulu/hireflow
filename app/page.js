import Link from 'next/link';
import { ArrowRight, CheckCircle2, ShieldCheck, Zap, Globe, Sparkles, TrendingUp, Users } from 'lucide-react';
import PageTransition from '@/components/PageTransition';

export const metadata = {
  title: 'HireFlow — Unlock a World of Career Opportunities',
  description: 'Manage your entire hiring process from one place.',
};

export default function LandingPage() {
  return (
    <PageTransition>
      <div className="min-h-screen font-sans hf-in" style={{ backgroundColor: 'var(--gray-50)' }}>
      
      {/* Navigation */}
      <nav className="max-w-[1400px] mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {/* Logo */}
          <img src="/images/hireflow-logo.png" alt="HireFlow" className="h-8 w-8 rounded-full bg-white object-contain flex-shrink-0" />
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium" style={{ color: 'var(--brand-900)' }}>
          <Link href="/jobs" transitionTypes={['nav-forward']} className="hover:opacity-70 transition-opacity">Find a Job</Link>
          <Link href="/about" transitionTypes={['nav-forward']} className="hover:opacity-70 transition-opacity">About Us</Link>
          <Link href="/services" transitionTypes={['nav-forward']} className="hover:opacity-70 transition-opacity">Services</Link>
          <Link href="#" className="hover:opacity-70 transition-opacity">Case Studies</Link>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login" transitionTypes={['nav-forward']} className="hidden sm:block text-sm font-medium hover:opacity-70" style={{ color: 'var(--brand-900)' }}>
            Sign In
          </Link>
          <Link href="/register" transitionTypes={['nav-forward']} className="px-5 py-2.5 rounded-full text-sm font-medium text-white transition-transform hover:scale-105" style={{ backgroundColor: 'var(--brand-600)' }}>
            Book a Demo
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 mb-20 mt-4">
        <div className="relative overflow-hidden p-10 md:p-16 lg:p-24 rounded-[32px] md:rounded-[40px] flex flex-col lg:flex-row items-center gap-12" style={{ backgroundColor: 'var(--brand-700)' }}>
          
          {/* Hero Content */}
          <div className="flex-1 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/90 text-xs font-medium mb-8">
              <Sparkles size={14} /> Global Job Finder Plus Portal
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-semibold text-white leading-[1.1] mb-6 tracking-tight">
              Unlock a World of <span style={{ color: 'var(--brand-100)' }}>Career</span> Opportunities with HireFlow
            </h1>
            
            <p className="text-white/80 text-lg max-w-xl mb-10 leading-relaxed">
              HireFlow connects you with the roles that align with your goals, making your next big career move just a click away.
            </p>
            
            <Link href="/register" transitionTypes={['nav-forward']} className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold text-base transition-transform hover:scale-105" style={{ backgroundColor: 'var(--brand-100)', color: 'var(--brand-900)' }}>
              Get Started Now <ArrowRight size={18} />
            </Link>
          </div>

          {/* Hero Graphics (Floating UI Cards) */}
          <div className="flex-1 relative w-full h-[400px] hidden lg:block z-10">
            
            {/* Top Card */}
            <div className="absolute top-0 right-12 bg-white p-4 rounded-2xl shadow-xl w-64 flex items-center gap-4 transform rotate-[-2deg]">
              <div className="w-12 h-12 bg-orange-100 rounded-full overflow-hidden">
                <img src="https://i.pravatar.cc/150?u=mark" alt="User" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Mark Wood</p>
                <p className="text-xs text-gray-500">Recruiter</p>
              </div>
            </div>

            {/* Middle Big Card */}
            <div className="absolute top-24 left-10 bg-white p-6 rounded-3xl shadow-2xl w-80 z-20">
              <h3 className="font-semibold text-gray-900 text-lg mb-4">Job Success</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-medium text-gray-500 mb-2">
                    <span>Remote Hiring</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: '80%', backgroundColor: 'var(--brand-600)' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-gray-500 mb-2">
                    <span>In House Hiring</span>
                    <span style={{ color: 'var(--brand-600)' }}>$500 / $2500</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: '60%', backgroundColor: 'var(--brand-600)' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Right Card */}
            <div className="absolute bottom-10 right-0 bg-white p-5 rounded-2xl shadow-xl flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-500 flex items-center justify-center text-white shadow-lg shadow-red-200">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-900 text-sm">Motion Designer</p>
                <p className="text-xs text-gray-500">Airbnb • Remote</p>
              </div>
            </div>

            {/* Floating Search Bar */}
            <div className="absolute -bottom-6 left-20 bg-white py-3 px-5 rounded-full shadow-lg flex items-center gap-3 w-72 z-30">
              <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
              </div>
              <span className="text-sm text-gray-400">Find your dream job...</span>
            </div>

          </div>
          
          {/* Decorative background shapes */}
          <div className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full mix-blend-overlay opacity-20 pointer-events-none translate-x-1/3 -translate-y-1/3" style={{ background: 'radial-gradient(circle, var(--brand-100) 0%, transparent 70%)' }}></div>
        </div>
      </main>

      {/* Features Grid */}
      <section className="max-w-[1200px] mx-auto px-6 py-12 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          <div className="flex flex-col gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--brand-100)' }}>
              <TrendingUp size={24} style={{ color: 'var(--brand-700)' }} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Cost Efficiency</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              SaaS solutions typically operate on a subscription basis, eliminating the need for significant upfront.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--brand-100)' }}>
              <Globe size={24} style={{ color: 'var(--brand-700)' }} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Automatic Updates</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Access your financial data from with an internet connection, so your staff can work remotely.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--brand-100)' }}>
              <ShieldCheck size={24} style={{ color: 'var(--brand-700)' }} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Enhanced Security</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Providers regularly deploy updates and fresh features so that you always get most latest tools.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--brand-100)' }}>
              <Users size={24} style={{ color: 'var(--brand-700)' }} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Scalability & Flexibility</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Many SaaS solutions are designed to comply with industry standards and regulations.
            </p>
          </div>

        </div>
      </section>

      {/* Increase Job Success Banner */}
      <section className="max-w-[1400px] mx-auto px-6 mb-24">
        <div className="bg-white rounded-[40px] p-10 md:p-16 flex flex-col lg:flex-row items-center justify-between gap-12 shadow-sm border border-gray-100/50">
          
          <div className="flex-1 max-w-lg">
            <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-6 leading-tight tracking-tight">
              Increase Your Job Success
            </h2>
            <p className="text-gray-500 mb-8 text-lg">
              Empowering Businesses with Top Talent, Every Day
            </p>
            <Link href="/register" transitionTypes={['nav-forward']} className="inline-flex px-8 py-4 rounded-full font-semibold text-white transition-transform hover:scale-105" style={{ backgroundColor: 'var(--brand-600)' }}>
              Get Started Now
            </Link>
          </div>

          <div className="flex-1 flex flex-col sm:flex-row gap-6 w-full">
            {/* Embedded Mini Widget 1 */}
            <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 flex-1">
               <h3 className="font-semibold text-gray-900 text-lg mb-6">Job Success</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-xs font-medium text-gray-500 mb-2">
                    <span>Remote Hiring</span>
                  </div>
                  <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: '85%', backgroundColor: 'var(--brand-600)' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-medium text-gray-500 mb-2">
                    <span>In House Hiring</span>
                    <span style={{ color: 'var(--brand-600)' }}>$500 / $2500</span>
                  </div>
                  <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: '65%', backgroundColor: 'var(--brand-600)' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Embedded Mini Widget 2 */}
            <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 flex-1 flex flex-col justify-between">
               <div className="flex justify-between items-start mb-4">
                 <h3 className="font-semibold text-gray-900 text-lg">Reviews</h3>
                 <span className="px-3 py-1 rounded-full text-xs font-medium text-white" style={{ backgroundColor: 'var(--brand-600)' }}>Recommended</span>
               </div>
               <p className="text-sm text-gray-500 leading-relaxed mb-6">
                 Built for everyone, irrespective of age, salary or wealth.
               </p>
               <button className="w-full py-3 rounded-2xl bg-gray-50 text-gray-900 text-sm font-semibold hover:bg-gray-100 transition-colors">
                 See recommendation
               </button>
            </div>
          </div>

        </div>
      </section>

      {/* Trusted Companies */}
      <section className="max-w-[1200px] mx-auto px-6 pb-32 text-center">
        <div className="inline-block px-4 py-1.5 rounded-full border border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-6">
          Companies
        </div>
        <h2 className="text-4xl font-semibold text-gray-900 mb-4 tracking-tight">
          Trusted companies
        </h2>
        <p className="text-gray-500 mb-12">
          Empowering Businesses with Top Talent, Every Day
        </p>
        
        <div className="flex flex-wrap justify-center gap-4 md:gap-6">
          {/* Amara */}
          <div className="px-8 py-5 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center gap-2 grayscale hover:grayscale-0 transition-all cursor-pointer">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: 'var(--brand-600)' }}>a</div>
            <span className="font-bold text-xl text-gray-800 tracking-tight">amara</span>
          </div>
          {/* Acme */}
          <div className="px-8 py-5 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center gap-2 grayscale hover:grayscale-0 transition-all cursor-pointer">
            <div className="text-blue-500">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
            </div>
            <span className="font-bold text-xl text-gray-800 tracking-tight">acme</span>
          </div>
          {/* Stari */}
          <div className="px-8 py-5 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center gap-2 grayscale hover:grayscale-0 transition-all cursor-pointer">
            <div className="w-6 h-6 flex items-center justify-center text-white" style={{ backgroundColor: 'var(--brand-600)' }}>
               <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
            </div>
            <span className="font-bold text-xl text-gray-800 tracking-tight">stari</span>
          </div>
          {/* Goldline */}
          <div className="px-8 py-5 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center gap-2 grayscale hover:grayscale-0 transition-all cursor-pointer">
            <div className="flex gap-0.5 items-end" style={{ color: 'var(--brand-600)' }}>
              <div className="w-1 h-3 bg-current rounded-full"></div>
              <div className="w-1 h-5 bg-current rounded-full"></div>
              <div className="w-1 h-4 bg-current rounded-full"></div>
            </div>
            <span className="font-bold text-xl text-gray-800 tracking-tight">goldline</span>
          </div>
        </div>
      </section>

      </div>
    </PageTransition>
  );
}
