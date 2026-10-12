import LegalPage from '@/components/LegalPage';
import { LEGAL_DOCUMENTS } from '@/lib/legalContent';

export const metadata = {
  title: 'Terms & Conditions | HireFlow',
  description: LEGAL_DOCUMENTS.terms.description,
};

export default function TermsPage() {
  return <LegalPage doc={LEGAL_DOCUMENTS.terms} />;
}
