// HireFlow Design System — Shared Utility Functions

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  getApplicationStatusBadgeClass,
  getMatchScoreTier,
} from './pipeline';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Returns the correct CSS class for a hiring stage badge
export function getStatusBadgeClass(status) {
  return getApplicationStatusBadgeClass(status);
}

// Returns the correct CSS class for a job status badge
export function getJobStatusClass(status) {
  const map = {
    active: 'hf-badge hf-badge-active',
    draft:  'hf-badge hf-badge-draft',
    paused: 'hf-badge hf-badge-paused',
    closed: 'hf-badge hf-badge-closed',
  };
  return map[status] || 'hf-badge hf-badge-draft';
}

// Returns color class based on match score
export function getMatchScoreClass(score) {
  return getMatchScoreTier(score)?.textClassName;
}

// Returns background class for match score pill
export function getMatchScoreBadge(score) {
  return getMatchScoreTier(score)?.badgeClassName;
}

// Relative time formatter
export function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Greeting based on time of day
export function getGreeting(name) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  return name ? `${greeting}, ${name.split(' ')[0]}` : greeting;
}

// Total years of professional experience from a candidate experience list
export function computeYearsOfExperience(experience) {
  const YEAR_MS = 365.25 * 24 * 60 * 60 * 1000;
  if (!Array.isArray(experience) || experience.length === 0) return 0;
  const spanDates = (start, end) => {
    const s = new Date(start).getTime();
    if (Number.isNaN(s)) return 0;
    const e = Number.isNaN(new Date(end).getTime()) || !end ? Date.now() : new Date(end).getTime();
    return Math.max(0, e - s);
  };
  const totalMs = experience.reduce((sum, entry) => sum + spanDates(entry.startDate, entry.endDate), 0);
  return Math.round((totalMs / YEAR_MS) * 10) / 10;
}

// Latest role (current first) from a candidate experience list
export function latestRole(experience) {
  if (!Array.isArray(experience) || experience.length === 0) return null;
  const current = experience.find((e) => e && e.current);
  const role = current || experience[0];
  return role && role.title ? role : null;
}

// Converts a stored resume path ("/uploads/cv-....txt") into the authenticated
// download endpoint. Resumes live outside /public, so there's no public URL.
// External (manual) links are passed through untouched.
export function getCvDownloadUrl(cvUrl) {
  if (!cvUrl) return '';
  const raw = String(cvUrl);
  if (!raw.startsWith('/uploads/')) return raw;
  const file = raw.split('?')[0].split('/').pop() || cvUrl;
  return `/api/cv?file=${encodeURIComponent(file)}`;
}
