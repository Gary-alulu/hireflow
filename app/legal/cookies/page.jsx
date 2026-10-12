import LegalPage from '@/components/LegalPage';
import { LEGAL_DOCUMENTS } from '@/lib/legalContent';

export const metadata = {
  title: 'Cookie Policy | HireFlow',
  description: LEGAL_DOCUMENTS.cookies.description,
};

export default function CookiesPage() {
  return <LegalPage doc={LEGAL_DOCUMENTS.cookies} />;
}
