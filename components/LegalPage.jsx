import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';
import PublicNav from '@/components/PublicNav';
import Footer from '@/components/Footer';
import { LEGAL_ICONS } from '@/lib/legalContent';

export default function LegalPage({ doc }) {
  const Icon = LEGAL_ICONS[doc.slug] || FileText;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--gray-50)' }}>
      <PublicNav />

      <main className="flex-1">
        <header className="legal-hero">
          <div className="legal-hero-inner">
            <Link href="/legal" className="legal-back">
              <ArrowLeft size={15} /> Legal Center
            </Link>
            <div className="legal-hero-badge">
              <Icon size={18} />
              <span>{doc.category}</span>
            </div>
            <h1 className="legal-title">{doc.title}</h1>
            <p className="legal-lede">{doc.description}</p>
            <p className="legal-updated">Last updated {doc.updated}</p>
          </div>
        </header>

        <div className="legal-layout">
          <aside className="legal-toc" aria-label="On this page">
            <p className="legal-toc-title">On this page</p>
            <ol>
              {doc.sections.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`}>{section.heading}</a>
                </li>
              ))}
            </ol>
          </aside>

          <article className="legal-body">
            {doc.intro ? (
              <div className="legal-intro">
                {doc.intro.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            ) : null}

            {doc.sections.map((section) => (
              <section id={section.id} key={section.id} className="legal-section">
                <h2>{section.heading}</h2>
                {section.body?.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
                {section.bullets ? (
                  <ul>
                    {section.bullets.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                ) : null}
                {section.table ? (
                  <div className="legal-table-wrap">
                    <table className="legal-table">
                      <thead>
                        <tr>
                          {section.table.head.map((cell, i) => (
                            <th key={i}>{cell}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {section.table.rows.map((row, i) => (
                          <tr key={i}>
                            {row.map((cell, j) => (
                              <td key={j}>{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : null}
                {section.contact ? (
                  <div className="legal-contact">
                    <p>{section.contact.text}</p>
                    <a href={`mailto:${section.contact.email}`} className="legal-contact-link">
                      {section.contact.email}
                    </a>
                  </div>
                ) : null}
              </section>
            ))}

            <div className="legal-related">
              <p>Related documents</p>
              <div className="legal-related-links">
                {doc.related.map((link) => (
                  <Link key={link.href} href={link.href} className="hf-btn hf-btn-secondary text-sm">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}
