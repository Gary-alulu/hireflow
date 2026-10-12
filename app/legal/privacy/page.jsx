import LegalPage from '@/components/LegalPage';
import { LEGAL_DOCUMENTS } from '@/lib/legalContent';

export const metadata = {
  title: 'Privacy Policy | HireFlow',
  description: LEGAL_DOCUMENTS.privacy.description,
};

export default function PrivacyPage() {
  return <LegalPage doc={LEGAL_DOCUMENTS.privacy} />;
}
