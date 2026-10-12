import RecruiterSidebar from '@/components/RecruiterSidebar';
import NotificationBell from '@/components/NotificationBell';
import MobileNav from '@/components/MobileNav';

export const metadata = {
  title: 'Recruiter Dashboard — HireFlow',
};

export default function RecruiterDashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <RecruiterSidebar />
      <main className="flex-1 flex flex-col min-w-0">
        <MobileNav role="recruiter" />
        <header
          className="flex justify-end items-center px-4 md:px-6 py-2.5 md:py-3 sticky top-0 z-30"
          style={{ backgroundColor: 'var(--page-bg)', borderBottom: '1px solid var(--color-border)' }}
        >
          <NotificationBell role="recruiter" />
        </header>
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="hf-stagger" style={{ maxWidth: 'var(--content-max)', margin: '0 auto' }}>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}