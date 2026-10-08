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
