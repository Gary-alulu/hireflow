// Recruiter-defined candidate tags (Feature 20). A short, opinionated vocabulary
// recruiters apply to candidates — Strong Candidate, Needs Review, Urgent, etc.
// Shared by application tags and SavedCandidate (talent pool) tags.

export const RECRUITER_TAG_PRESETS = Object.freeze([
  'Strong Candidate',
  'Needs Review',
  'Urgent',
  'Frontend',
  'Backend',
  'Full-Stack',
  'Senior',
  'Junior',
  'Remote',
  'Local',
  'Potential',
  'On Hold',
  'Rejected',
]);

const MAX_TAGS = 12;
const MAX_TAG_LENGTH = 30;

// Normalizes a raw tag value (comma-separated string, array, or single string)
// into a clean, capped array of unique tags.
export function normalizeTags(value) {
  const raw = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(',').concat(value.split('\n'))
      : [];
  const seen = new Set();
  const out = [];
  for (const item of raw) {
    if (typeof item !== 'string') continue;
    const tag = item.trim().slice(0, MAX_TAG_LENGTH);
    if (!tag) continue;
    const key = tag.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(tag);
    if (out.length >= MAX_TAGS) break;
  }
  return out;
}