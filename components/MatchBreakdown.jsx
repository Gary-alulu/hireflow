'use client';

import { Check, ShieldCheck, Sparkles, TriangleAlert } from 'lucide-react';

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export default function MatchBreakdown({ application, compact = false }) {
  const score = application?.matchScore;
  const strengths = application?.matchStrengths || [];
  const gaps = application?.matchGaps || [];
  const recommendation = application?.matchRecommendation || '';

  if (typeof score !== 'number') return null;

  return (
    <div className={compact ? '' : 'mt-5 rounded-xl border p-4'}>
      {!compact && (
        <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          <Sparkles size={14} className="text-indigo-500" aria-hidden="true" />
          AI Match Analysis
        </p>
      )}

      {strengths.length > 0 && (
        <ul className={`${compact ? 'mb-1 space-y-0.5' : 'mb-3 space-y-1'} text-sm text-gray-700`}>
          {strengths.map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <Check size={16} className="mt-0.5 flex-shrink-0 text-emerald-500" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}

      {gaps.length > 0 && (
        <ul className={`${compact ? 'mb-1 space-y-0.5' : 'mb-3 space-y-1'} text-sm text-gray-700`}>
          {gaps.map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <TriangleAlert size={16} className="mt-0.5 flex-shrink-0 text-amber-500" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}

      {recommendation && (
        <div className="rounded-lg border border-indigo-100 bg-indigo-50/60 p-3 text-sm text-gray-800">
          <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-indigo-600">
            <Sparkles size={12} aria-hidden="true" />
            AI Recommendation
          </p>
          <p>{capitalize(recommendation)}</p>
        </div>
      )}

      <p className="mt-3 flex items-center gap-1.5 text-xs text-gray-400">
        <ShieldCheck size={13} aria-hidden="true" />
        AI analysis assists your review. The hiring decision is always yours.
      </p>
    </div>
  );
}