// HireFlow Hiring Pipeline — single source of truth for the application stage structure.
//
// Every layer derives its stage list from here: the Mongoose enum, API validation,
// API responses, the recruiter pipeline board, applicant stage filters and candidate
// views. Adding, renaming or reordering a stage is a one-line change in this file.
//
// The stage values live in a JSON file because scripts/seed.js is CommonJS and this
// package has no "type": "module", so it cannot import this ES module. JSON is the one
// format both module systems read natively.

import APPLICATION_STATUS_VALUES from './application-statuses.json' with { type: 'json' };

export const APPLICATION_STATUSES = Object.freeze(APPLICATION_STATUS_VALUES);

export const DEFAULT_APPLICATION_STATUS = APPLICATION_STATUSES[0];

// Outcomes a candidate cannot progress further out of.
export const TERMINAL_APPLICATION_STATUSES = Object.freeze(['Hired', 'Rejected']);

const APPLICATION_STATUS_SET = new Set(APPLICATION_STATUSES);

// globals.css declares one `hf-badge-<stage>` rule per stage, so the class name is
// derived from the stage value rather than maintained as a parallel hand-written list.
const UNKNOWN_STATUS_BADGE_CLASS = 'hf-badge hf-badge-unknown';

export function isApplicationStatus(value) {
  return typeof value === 'string' && APPLICATION_STATUS_SET.has(value);
}

export function getApplicationStatusBadgeClass(status) {
  return isApplicationStatus(status)
    ? `hf-badge hf-badge-${status.toLowerCase()}`
    : UNKNOWN_STATUS_BADGE_CLASS;
}

// Serialisable stage descriptor so API clients render stages and their badges from
// the server's copy instead of hardcoding a fourth list of their own.
export function serializeApplicationStatuses() {
  return APPLICATION_STATUSES.map((status) => ({
    value: status,
    badgeClassName: getApplicationStatusBadgeClass(status),
    terminal: TERMINAL_APPLICATION_STATUSES.includes(status),
  }));
}

export function createEmptyPipelineCounts() {
  return APPLICATION_STATUSES.reduce((counts, status) => {
    counts[status] = 0;
    return counts;
  }, {});
}

// Always returns a key for every stage, so callers can render a complete pipeline
// board without inventing counts for stages that happen to be empty. Stages holding
// data that is no longer part of the pipeline are ignored rather than displayed.
export function tallyApplicationsByStatus(applications) {
  const counts = createEmptyPipelineCounts();
  for (const application of applications) {
    if (isApplicationStatus(application.status)) {
      counts[application.status] += 1;
    }
  }
  return counts;
}

// --- AI MATCH SCORE ---
// One tier table drives every match score in the product. `textClassName` is for bare
// numerals in tables; `badgeClassName` is for pill-shaped scores. Both must agree, so
// a score never changes colour depending on which page renders it.

const MATCH_SCORE_TIERS = Object.freeze([
  Object.freeze({
    key: 'high',
    min: 75,
    textClassName: 'hf-match-high',
    badgeClassName: 'hf-badge hf-match-badge-high',
  }),
  Object.freeze({
    key: 'medium',
    min: 50,
    textClassName: 'hf-match-medium',
    badgeClassName: 'hf-badge hf-match-badge-medium',
  }),
  Object.freeze({
    key: 'low',
    min: 0,
    textClassName: 'hf-match-low',
    badgeClassName: 'hf-badge hf-match-badge-low',
  }),
]);

export function hasMatchScore(score) {
  return typeof score === 'number' && Number.isFinite(score);
}

export function getMatchScoreTier(score) {
  if (!hasMatchScore(score)) return null;
  return MATCH_SCORE_TIERS.find((tier) => score >= tier.min) ?? MATCH_SCORE_TIERS[MATCH_SCORE_TIERS.length - 1];
}