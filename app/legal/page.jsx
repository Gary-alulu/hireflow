import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import PublicNav from '@/components/PublicNav';
import Footer from '@/components/Footer';
import { LEGAL_INDEX, LEGAL_ICONS, LEGAL_UPDATED } from '@/lib/legalContent';

export const metadata = {
  title: 'Legal Center | HireFlow',
  description: 'Privacy Policy, Terms & Conditions, Cookie Policy, and platform policies for HireFlow.',
};

export default function LegalCenterPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--gray-50)' }}>
      <PublicNav />

      <main className="flex-1 legal-hub">
        <div className="legal-hub-head">
          <p className="legal-hub-eyebrow">Legal Center</p>
          <h1 className="legal-hub-title">Trust, in plain language</h1>
          <p className="legal-hub-lede">
            Everything that governs how HireFlow works — your data, our agreement with you, and the
            standards everyone on the platform is expected to follow.
          </p>
        </div>

        <div className="legal-hub-grid">
          {LEGAL_INDEX.map((item) => {
            const Icon = LEGAL_ICONS[item.slug];
            return (
              <Link key={item.slug} href={`/legal/${item.slug}`} className="legal-hub-card">
                <span className="legal-hub-card-icon">
                  <Icon size={20} />
                </span>
                <h2>{item.title}</h2>
                <p>{item.blurb}</p>
                <span className="legal-hub-card-more">
                  Read document <ArrowRight size={15} />
                </span>
              </Link>
            );
          })}
        </div>

        <p className="legal-updated" style={{ marginTop: 40, color: 'var(--gray-400)' }}>
          All documents last updated {LEGAL_UPDATED}.
        </p>
      </main>

      <Footer />
    </div>
  );
}
