import { Shield, ScrollText, Cookie, Scale } from 'lucide-react';

export const LEGAL_UPDATED = 'January 1, 2026';
export const LEGAL_EMAIL = 'legal@hireflow.app';

export const LEGAL_ICONS = {
  privacy: Shield,
  terms: ScrollText,
  cookies: Cookie,
  policies: Scale,
};

export const LEGAL_INDEX = [
  {
    slug: 'privacy',
    category: 'Data & Privacy',
    title: 'Privacy Policy',
    description: 'How HireFlow collects, uses, shares, and protects your personal data.',
    blurb: 'What we collect, why we collect it, and the controls you have over your data.',
  },
  {
    slug: 'terms',
    category: 'Agreement',
    title: 'Terms & Conditions',
    description: 'The rules that govern your access to and use of the HireFlow platform.',
    blurb: 'Your rights and responsibilities when using HireFlow as a candidate or recruiter.',
  },
  {
    slug: 'cookies',
    category: 'Data & Privacy',
    title: 'Cookie Policy',
    description: 'How HireFlow uses cookies and similar technologies, and how to manage them.',
    blurb: 'The cookies we set, why we set them, and how you can control them.',
  },
  {
    slug: 'policies',
    category: 'Platform Rules',
    title: 'Platform Policies',
    description: 'Acceptable use, fair hiring, moderation, security, and AI transparency policies.',
    blurb: 'The standards that keep hiring on HireFlow fair, safe, and trustworthy.',
  },
];

const EMAIL_BLOCK = {
  text: 'Questions about this document? Contact our team at',
  email: LEGAL_EMAIL,
};

export const LEGAL_DOCUMENTS = {
  privacy: {
    slug: 'privacy',
    category: 'Data & Privacy',
    title: 'Privacy Policy',
    description:
      'This Privacy Policy explains how HireFlow collects, uses, shares, and safeguards personal data when you use our website, platform, and related services.',
    updated: LEGAL_UPDATED,
    intro: [
      'HireFlow ("HireFlow", "we", "us", or "our") is committed to protecting your privacy. This policy applies to all users of the HireFlow platform, including candidates, recruiters, and visitors.',
      'By using HireFlow you agree to the collection and use of information in accordance with this policy. If you do not agree, please do not use the platform.',
    ],
    sections: [
      {
        id: 'information-we-collect',
        heading: '1. Information We Collect',
        body: [
          'We collect information you provide directly, information generated as you use the platform, and limited information from third parties.',
        ],
        bullets: [
          'Account data: name, email address, password (stored as a salted hash), and account role.',
          'Candidate profile data: work history, education, skills, location, and preferences.',
          'Application data: CVs and cover letters you submit, plus application status history.',
          'Recruiter and company data: company name, role, and job postings you create.',
          'Usage data: pages viewed, features used, device and browser type, and approximate location derived from IP address.',
          'Communications: messages exchanged through the platform and support requests you send us.',
        ],
      },
      {
        id: 'how-we-use',
        heading: '2. How We Use Your Information',
        body: ['We use your information to operate, improve, and secure HireFlow.'],
        bullets: [
          'To create and manage your account and authenticate your access.',
          'To power candidate matching, ranking, and relevant job recommendations.',
          'To enable recruiters to review applications and communicate with candidates.',
          'To send transactional notifications, security alerts, and support responses.',
          'To detect, prevent, and investigate fraud, abuse, and security incidents.',
          'To analyze aggregate usage so we can improve product performance and features.',
        ],
      },
      {
        id: 'ai-processing',
        heading: '3. AI Processing and Candidate Matching',
        body: [
          'HireFlow uses automated and AI-assisted systems to parse CVs, extract skills, score relevance, and surface matches between candidates and roles. These systems support human decision-making; they do not make final hiring decisions on behalf of recruiters.',
          'You can review and edit the structured profile data we derive from your CV. Where required by law, you have the right to request human review of automated processing that significantly affects you.',
        ],
      },
      {
        id: 'legal-bases',
        heading: '4. Legal Bases for Processing',
        body: [
          'Where the EU/UK General Data Protection Regulation applies, we process personal data on the following legal bases:',
        ],
        bullets: [
          'Performance of a contract — to provide the services you request.',
          'Legitimate interests — to secure the platform, prevent fraud, and improve our services.',
          'Consent — for optional cookies, marketing, and certain AI features where required.',
          'Legal obligation — to comply with applicable laws and lawful requests.',
        ],
      },
      {
        id: 'sharing',
        heading: '5. Sharing and Disclosure',
        body: [
          'We do not sell your personal data. We share it only as needed to run the service and as described below.',
        ],
        bullets: [
          'With recruiters — when you apply to a job, the posting company can see your application and profile.',
          'With service providers — vetted vendors for hosting, email delivery, analytics, and security under contract.',
          'For legal reasons — where required by law, regulation, or valid legal process.',
          'In a business transfer — in connection with a merger, acquisition, or sale of assets, with notice to you.',
        ],
      },
      {
        id: 'retention',
        heading: '6. Data Retention',
        body: [
          'We retain personal data for as long as your account is active or as needed to provide the service. When you delete your account, we remove or de-identify your data within a reasonable period, except where we must retain it to meet legal, security, or accounting obligations.',
        ],
      },
      {
        id: 'security',
        heading: '7. Security',
        body: [
          'We use administrative, technical, and physical safeguards designed to protect your data, including encryption in transit, hashed credentials, role-based access controls, and routine security reviews. No method of transmission or storage is completely secure, so we cannot guarantee absolute security.',
        ],
      },
      {
        id: 'your-rights',
        heading: '8. Your Rights and Choices',
        body: ['Depending on your location, you may have the following rights:'],
        bullets: [
          'Access the personal data we hold about you.',
          'Correct inaccurate or incomplete data.',
          'Request deletion of your data, subject to legal exceptions.',
          'Object to or restrict certain processing, including direct marketing.',
          'Request data portability in a machine-readable format.',
          'Withdraw consent at any time where processing is based on consent.',
        ],
      },
      {
        id: 'international-transfers',
        heading: '9. International Data Transfers',
        body: [
          'HireFlow may process and store data in countries other than your own. Where we transfer personal data across borders, we use appropriate safeguards such as standard contractual clauses and rely on lawful transfer mechanisms.',
        ],
      },
      {
        id: 'children',
        heading: "10. Children's Privacy",
        body: [
          'HireFlow is not intended for anyone under the age of 16. We do not knowingly collect personal data from children. If you believe a child has provided us with data, please contact us and we will delete it.',
        ],
      },
      {
        id: 'changes',
        heading: '11. Changes to This Policy',
        body: [
          'We may update this policy from time to time. Material changes will be announced on the platform or by email before they take effect, and the "Last updated" date above will be revised.',
        ],
      },
      {
        id: 'contact',
        heading: '12. Contact Us',
        contact: EMAIL_BLOCK,
      },
    ],
    related: [
      { label: 'Cookie Policy', href: '/legal/cookies' },
      { label: 'Terms & Conditions', href: '/legal/terms' },
      { label: 'Platform Policies', href: '/legal/policies' },
    ],
  },

  terms: {
    slug: 'terms',
    category: 'Agreement',
    title: 'Terms & Conditions',
    description:
      'These Terms & Conditions govern your access to and use of the HireFlow platform. Please read them carefully before using our services.',
    updated: LEGAL_UPDATED,
    intro: [
      'These Terms & Conditions ("Terms") form a binding agreement between you and HireFlow. By creating an account, posting a job, applying to a role, or otherwise using the platform, you accept these Terms.',
    ],
    sections: [
      {
        id: 'agreement',
        heading: '1. Agreement to Terms',
        body: [
          'By accessing or using HireFlow you confirm that you can form a binding contract and that you agree to these Terms and our Privacy Policy. If you use HireFlow on behalf of an organization, you represent that you have authority to bind that organization.',
        ],
      },
      {
        id: 'eligibility',
        heading: '2. Eligibility',
        body: [
          'You must be at least 16 years old to use HireFlow. If you are under the age of majority in your jurisdiction, you may use the platform only with the involvement of a parent or guardian.',
        ],
      },
      {
        id: 'accounts',
        heading: '3. Accounts and Registration',
        body: [
          'You are responsible for the accuracy of your account information and for keeping your credentials confidential. You agree to notify us promptly of any unauthorized use of your account.',
        ],
        bullets: [
          'Do not share your login with others or create accounts by automated means.',
          'One person or organization per account, unless we agree otherwise in writing.',
          'You are responsible for all activity that occurs under your account.',
        ],
      },
      {
        id: 'acceptable-use',
        heading: '4. Acceptable Use',
        body: [
          'You agree not to misuse the platform. Prohibited conduct includes, but is not limited to:',
        ],
        bullets: [
          'Posting false, misleading, discriminatory, or unlawful content.',
          'Scraping, harvesting, or bulk-collecting data from the platform.',
          'Attempting to access accounts or data you are not authorized to access.',
          'Uploading malware or interfering with the operation of the service.',
          'Using automated systems to apply to jobs or contact candidates in a deceptive manner.',
        ],
      },
      {
        id: 'recruiter-terms',
        heading: '5. Recruiter Terms',
        body: ['If you post jobs on HireFlow, you additionally agree that:'],
        bullets: [
          'Job postings must be for genuine, current vacancies with an identified employer.',
          'Postings must comply with all applicable employment and anti-discrimination laws.',
          'You will handle candidate data lawfully and only for legitimate hiring purposes.',
          'You will not charge candidates a fee to apply or to be considered for a role.',
        ],
      },
      {
        id: 'candidate-terms',
        heading: '6. Candidate Terms',
        body: [
          'If you apply to roles through HireFlow, you agree to provide accurate and truthful information about your experience, qualifications, and identity, and to use the platform only for lawful job-seeking purposes.',
        ],
      },
      {
        id: 'fees',
        heading: '7. Fees and Subscriptions',
        body: [
          'Certain features are offered under paid plans. Fees, billing cycles, and included features are described at the point of purchase. Paid plans renew automatically until cancelled, and fees are non-refundable except where required by law.',
        ],
      },
      {
        id: 'intellectual-property',
        heading: '8. Intellectual Property',
        body: [
          'The platform, including its software, design, trademarks, and content, is owned by HireFlow or its licensors and is protected by intellectual property laws. You may not copy, modify, distribute, or create derivative works except as expressly permitted.',
        ],
      },
      {
        id: 'content-ownership',
        heading: '9. Your Content',
        body: [
          'You retain ownership of the content you submit, such as CVs, profiles, and job postings. You grant HireFlow a worldwide, non-exclusive, royalty-free license to host, process, and display that content solely to operate and provide the service.',
        ],
      },
      {
        id: 'disclaimer',
        heading: '10. Disclaimer of Warranties',
        body: [
          'HireFlow is provided "as is" and "as available" without warranties of any kind, express or implied. We do not warrant that the service will be uninterrupted, error-free, or that any match, candidate, or job will meet your expectations.',
        ],
      },
      {
        id: 'liability',
        heading: '11. Limitation of Liability',
        body: [
          'To the maximum extent permitted by law, HireFlow will not be liable for indirect, incidental, special, consequential, or punitive damages, or for lost profits or data. Our total liability for any claim will not exceed the greater of the fees you paid us in the twelve months before the claim or one hundred US dollars.',
        ],
      },
      {
        id: 'termination',
        heading: '12. Termination',
        body: [
          'You may stop using HireFlow at any time. We may suspend or terminate your access if you violate these Terms or if we are required to by law. Provisions that by their nature should survive termination will continue to apply.',
        ],
      },
      {
        id: 'governing-law',
        heading: '13. Governing Law and Disputes',
        body: [
          'These Terms are governed by the laws of the jurisdiction in which HireFlow is established, without regard to conflict-of-law principles. Disputes will be resolved in the competent courts of that jurisdiction, unless mandatory consumer protections in your country provide otherwise.',
        ],
      },
      {
        id: 'changes',
        heading: '14. Changes to These Terms',
        body: [
          'We may revise these Terms from time to time. If we make material changes, we will provide notice on the platform or by email before they take effect. Continued use after the effective date constitutes acceptance.',
        ],
      },
      {
        id: 'contact',
        heading: '15. Contact',
        contact: EMAIL_BLOCK,
      },
    ],
    related: [
      { label: 'Privacy Policy', href: '/legal/privacy' },
      { label: 'Platform Policies', href: '/legal/policies' },
      { label: 'Cookie Policy', href: '/legal/cookies' },
    ],
  },

  cookies: {
    slug: 'cookies',
    category: 'Data & Privacy',
    title: 'Cookie Policy',
    description:
      'This Cookie Policy explains how HireFlow uses cookies and similar technologies, what categories we use, and how you can control them.',
    updated: LEGAL_UPDATED,
    intro: [
      'Cookies are small text files placed on your device that help websites function, remember your preferences, and understand how they are used. This policy should be read together with our Privacy Policy.',
    ],
    sections: [
      {
        id: 'what-are-cookies',
        heading: '1. What Are Cookies',
        body: [
          'A cookie is a small file stored by your browser. We also use related technologies such as local storage and pixels. Some cookies are deleted when you close your browser (session cookies); others remain for a set period (persistent cookies).',
        ],
      },
      {
        id: 'how-we-use',
        heading: '2. How We Use Cookies',
        body: [
          'We use cookies to keep you signed in, remember your settings, measure platform performance, and, where you allow it, understand how visitors use HireFlow so we can improve it.',
        ],
      },
      {
        id: 'categories',
        heading: '3. Categories of Cookies We Use',
        body: ['We group the cookies we use into the following categories:'],
        table: {
          head: ['Category', 'Purpose', 'Can you opt out?'],
          rows: [
            [
              'Strictly necessary',
              'Authentication, session security, load balancing, and core functionality.',
              'No — required for the service to work.',
            ],
            [
              'Preferences',
              'Remembering language, theme, and interface settings.',
              'Yes, though features may reset.',
            ],
            [
              'Analytics',
              'Aggregate measurement of how the platform is used so we can improve it.',
              'Yes.',
            ],
            [
              'Marketing',
              'Measuring the effectiveness of campaigns and, where permitted, personalizing content.',
              'Yes.',
            ],
          ],
        },
      },
      {
        id: 'third-party',
        heading: '4. Third-Party Cookies',
        body: [
          'Some cookies are set by third-party providers that help us deliver services, such as analytics and infrastructure vendors. These providers have their own privacy and cookie policies, and we encourage you to review them.',
        ],
      },
      {
        id: 'managing',
        heading: '5. Managing Your Cookie Preferences',
        body: [
          'You can manage cookies through our in-platform cookie preferences and through your browser settings. Most browsers let you block or delete cookies. Disabling strictly necessary cookies may prevent parts of HireFlow from working correctly.',
        ],
      },
      {
        id: 'do-not-track',
        heading: '6. Do Not Track',
        body: [
          'Some browsers send a "Do Not Track" signal. There is currently no common industry standard for how to respond to it, so HireFlow does not alter its practices based on these signals.',
        ],
      },
      {
        id: 'changes',
        heading: '7. Changes to This Policy',
        body: [
          'We may update this Cookie Policy as our practices or the law change. The "Last updated" date above reflects the most recent revision.',
        ],
      },
      {
        id: 'contact',
        heading: '8. Contact Us',
        contact: EMAIL_BLOCK,
      },
    ],
    related: [
      { label: 'Privacy Policy', href: '/legal/privacy' },
      { label: 'Terms & Conditions', href: '/legal/terms' },
      { label: 'Platform Policies', href: '/legal/policies' },
    ],
  },

  policies: {
    slug: 'policies',
    category: 'Platform Rules',
    title: 'Platform Policies',
    description:
      'A collection of the policies that keep hiring on HireFlow fair, safe, transparent, and trustworthy for candidates and recruiters alike.',
    updated: LEGAL_UPDATED,
    intro: [
      'These policies apply in addition to our Terms & Conditions and Privacy Policy. Together they describe the standards we expect from everyone who uses HireFlow.',
    ],
    sections: [
      {
        id: 'acceptable-use',
        heading: '1. Acceptable Use Policy',
        body: [
          'HireFlow exists to connect people with work. You may not use the platform to deceive, harass, discriminate, or harm others, or to distribute spam, malware, or unlawful content. Automated scraping, credential sharing, and attempts to bypass security are prohibited.',
        ],
      },
      {
        id: 'fair-hiring',
        heading: '2. Fair Hiring & Non-Discrimination Policy',
        body: [
          'Recruiters must not discriminate on the basis of race, color, ethnicity, national origin, religion, sex, gender identity, sexual orientation, disability, age, marital status, or any other protected characteristic.',
        ],
        bullets: [
          'Job posts must describe genuine requirements relevant to the role.',
          'Recruiters may not request sensitive personal information unrelated to hiring.',
          'Hiring decisions remain the responsibility of the employer, not HireFlow.',
        ],
      },
      {
        id: 'moderation',
        heading: '3. Content Moderation Policy',
        body: [
          'We review reports of policy violations and may remove content, restrict features, or suspend accounts. We aim to act fairly and proportionately, and we provide a way to appeal enforcement decisions.',
        ],
      },
      {
        id: 'data-processing',
        heading: '4. Data Processing & Security Policy',
        body: [
          'We process personal data only for the purposes described in our Privacy Policy and apply technical and organizational safeguards, including encryption in transit, access controls, and routine monitoring. Recruiters who receive candidate data must handle it lawfully and securely.',
        ],
      },
      {
        id: 'ai-transparency',
        heading: '5. AI Use & Transparency Policy',
        body: [
          'HireFlow uses AI to assist with parsing, matching, and ranking. We aim to be transparent about where automation is used and to keep a human in the loop for decisions that materially affect users.',
        ],
        bullets: [
          'Automated scores are assistive and not the sole basis for any hiring decision.',
          'We test our systems for bias and review outcomes on an ongoing basis.',
          'Users can flag unexpected or unfair automated results for review.',
        ],
      },
      {
        id: 'copyright',
        heading: '6. Copyright & DMCA Policy',
        body: [
          'We respect intellectual property rights. If you believe content on HireFlow infringes your copyright, contact us with the details required by applicable law, and we will review and act on valid notices, including removing infringing material.',
        ],
      },
      {
        id: 'enforcement',
        heading: '7. Enforcement and Reporting',
        body: [
          'To report a violation of these policies, email us with a description of the issue and any supporting evidence. We investigate reports and may take action ranging from a warning to permanent removal.',
        ],
        contact: EMAIL_BLOCK,
      },
    ],
    related: [
      { label: 'Terms & Conditions', href: '/legal/terms' },
      { label: 'Privacy Policy', href: '/legal/privacy' },
      { label: 'Cookie Policy', href: '/legal/cookies' },
    ],
  },
};
