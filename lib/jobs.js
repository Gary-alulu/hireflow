// HireFlow Job Management — single source of truth for job status workflow and
// form-field normalization shared by create, edit and workflow actions.
//
// Mirrors the lib/pipeline.js pattern: the status enum, allowed transitions and the
// field-shaping rules all live here so the API and UI cannot drift apart.

export const JOB_STATUSES = Object.freeze(['draft', 'active', 'paused', 'closed']);

export const JOB_STATUS_LABELS = Object.freeze({
  draft: 'Draft',
  active: 'Active',
  paused: 'Paused',
  closed: 'Closed',
});

// Draft -> Active -> Paused -> Closed, with "Reopen" (closed/paused -> active) and
// "Archive" (draft -> closed). A no-op status update is always valid.
export const JOB_STATUS_TRANSITIONS = Object.freeze({
  draft: ['active', 'closed'],
  active: ['paused', 'closed'],
  paused: ['active', 'closed'],
  closed: ['active'],
});

export function validateJobStatusTransition(from, to) {
  if (!JOB_STATUSES.includes(from) || !JOB_STATUSES.includes(to)) return false;
  if (from === to) return true;
  return (JOB_STATUS_TRANSITIONS[from] || []).includes(to);
}

const SCALAR_JOB_FIELDS = Object.freeze([
  'title',
  'department',
  'employmentType',
  'location',
  'workplaceType',
  'salaryRange',
  'description',
  'experienceLevel',
  'status',
]);

const LIST_JOB_FIELDS = Object.freeze(['responsibilities', 'requirements', 'benefits', 'questions']);

const JOB_FIELD_WHITELIST = new Set([
  ...SCALAR_JOB_FIELDS,
  ...LIST_JOB_FIELDS,
  'skills',
  'applicationDeadline',
  'customQuestions',
]);

function splitLines(value) {
  return typeof value === 'string'
    ? value.split('\n').map((s) => s.trim()).filter(Boolean)
    : Array.isArray(value)
      ? value.filter((s) => typeof s === 'string' && s.trim()).map((s) => s.trim())
      : undefined;
}

// Structured application questions: [{ question, required }]. Free-text or partial
// shapes are tolerated so a future API/UI stays backwards compatible.
function normalizeCustomQuestions(value) {
  if (!Array.isArray(value)) return [];
  const out = [];
  for (const item of value) {
    if (!item || typeof item !== 'object') continue;
    const question = String(item.question || '').trim().slice(0, 500);
    if (!question) continue;
    out.push({ question, required: Boolean(item.required) });
    if (out.length >= 10) break;
  }
  return out;
}

function splitCsv(value) {
  return typeof value === 'string'
    ? value.split(',').map((s) => s.trim()).filter(Boolean)
    : Array.isArray(value)
      ? value.filter((s) => typeof s === 'string' && s.trim()).map((s) => s.trim())
      : undefined;
}

// Sanitizes and shapes a raw request body into the exact fields a Job accepts.
// Only whitelisted keys survive, so a client can never overwrite recruiterId,
// companyId or any other server-managed field. Line-based lists accept either the
// textarea string form or an already-split array.
export function normalizeJobFields(body) {
  const out = {};
  for (const key of SCALAR_JOB_FIELDS) {
    if (body[key] !== undefined && body[key] !== null && body[key] !== '') {
      out[key] = body[key];
    }
  }
  if ('skills' in body && body.skills !== undefined && body.skills !== null) {
    out.skills = splitCsv(body.skills);
  }
  if ('customQuestions' in body && body.customQuestions !== undefined && body.customQuestions !== null) {
    out.customQuestions = normalizeCustomQuestions(body.customQuestions);
  }
  for (const key of LIST_JOB_FIELDS) {
    if (key in body && body[key] !== undefined && body[key] !== null) {
      out[key] = splitLines(body[key]);
    }
  }
  if (body.applicationDeadline) {
    const deadline = new Date(body.applicationDeadline);
    if (!Number.isNaN(deadline.getTime())) {
      out.applicationDeadline = deadline;
    }
  }
  Object.keys(out).forEach((k) => out[k] === undefined && delete out[k]);
  return out;
}

export function isJobFieldAllowed(key) {
  return JOB_FIELD_WHITELIST.has(key);
}

// First number in a free-text salary range ("$100k - $120k", "80,000 EUR") as a
// plain integer so the discovery board can filter on it. Returns 0 when the field
// is unparseable ("Competitive"), which the filters treat as "no salary listed".
export function parseSalaryMin(text) {
  if (!text) return 0;
  const match = String(text).replace(/,/g, '').match(/(\d+(?:\.\d+)?)\s*([kKmM])?/);
  if (!match) return 0;
  let value = parseFloat(match[1]);
  const suffix = (match[2] || '').toLowerCase();
  if (suffix === 'k') value *= 1e3;
  else if (suffix === 'm') value *= 1e6;
  return value;
}