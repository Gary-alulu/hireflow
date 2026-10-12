const SECTIONS = [
  { key: 'basic',          label: 'Contact info', fields: ['phone', 'location'] },
  { key: 'headline',       label: 'Headline & about', fields: ['headline', 'professionalSummary'] },
  { key: 'skills',         label: 'Skills', array: 'skills' },
  { key: 'experience',     label: 'Work experience', array: 'experience' },
  { key: 'education',      label: 'Education', array: 'education' },
  { key: 'certifications', label: 'Certifications', array: 'certifications' },
  { key: 'links',          label: 'Links & resume', fields: ['portfolioUrl', 'linkedInUrl', 'githubUrl', 'cvUrl'] },
];

const SCALAR_LABELS = {
  phone: 'Phone number',
  location: 'Location',
  headline: 'Professional headline',
  professionalSummary: 'About you',
  portfolioUrl: 'Portfolio / website',
  linkedInUrl: 'LinkedIn profile',
  githubUrl: 'GitHub profile',
  cvUrl: 'Resume / CV link',
};

export function computeProfileCompleteness(profile = {}) {
  const sections = SECTIONS.map((section) => {
    const missing = [];
    if (section.fields) {
      for (const field of section.fields) {
        const value = profile[field];
        if (!value || (typeof value === 'string' && !value.trim())) {
          missing.push(SCALAR_LABELS[field] || field);
        }
      }
    }
    if (section.array) {
      if (!Array.isArray(profile[section.array]) || profile[section.array].length === 0) {
        missing.push(SCALAR_LABELS[section.array] || section.label);
      }
    }
    return {
      key: section.key,
      label: section.label,
      anchor: section.key,
      complete: missing.length === 0,
      missing,
    };
  });

  const complete = sections.filter((s) => s.complete).length;
  const percent = sections.length ? Math.round((complete / sections.length) * 100) : 100;

  return { percent, complete, total: sections.length, sections };
}

export function profileFromForm(form) {
  const deepClean = (list) => (list || []).map((item) => Object.fromEntries(Object.entries(item || {}).filter(([, v]) => v !== '' && v != null)));
  return {
    phone: form.phone || '',
    location: form.location || '',
    profilePhoto: form.profilePhoto || '',
    headline: form.headline || '',
    professionalSummary: form.professionalSummary || '',
    skills: (form.skills || []).map((s) => s.trim()).filter(Boolean),
    experience: deepClean(form.experience),
    education: deepClean(form.education),
    certifications: deepClean(form.certifications),
    portfolioUrl: form.portfolioUrl || '',
    linkedInUrl: form.linkedInUrl || '',
    githubUrl: form.githubUrl || '',
    cvUrl: form.cvUrl || '',
  };
}