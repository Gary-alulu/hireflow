import RecruiterSidebar from '@/components/RecruiterSidebar';

export const metadata = {
  title: 'Recruiter Dashboard — HireFlow',
};

export default function RecruiterDashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <RecruiterSidebar />
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
