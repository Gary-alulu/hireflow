import CandidateSidebar from '@/components/CandidateSidebar';

export const metadata = {
  title: 'Candidate Dashboard — HireFlow',
};

export default function CandidateDashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <CandidateSidebar />
      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 overflow-auto" style={{ padding: '32px' }}>
          <div className="hf-stagger" style={{ maxWidth: 'var(--content-max)', margin: '0 auto' }}>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
