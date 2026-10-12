import LegalPage from '@/components/LegalPage';
import { LEGAL_DOCUMENTS } from '@/lib/legalContent';

export const metadata = {
  title: 'Platform Policies | HireFlow',
  description: LEGAL_DOCUMENTS.policies.description,
};

export default function PoliciesPage() {
  return <LegalPage doc={LEGAL_DOCUMENTS.policies} />;
}
