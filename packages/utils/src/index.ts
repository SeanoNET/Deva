import type { Priority, WorkType } from '@deva/types';

// Format utilities
export function formatDate(date: Date | number): string {
  const d = typeof date === 'number' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatTime(date: Date | number): string {
  const d = typeof date === 'number' ? new Date(date) : date;
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Priority utilities
export function getPriorityColor(priority: Priority): string {
  const colors = {
    critical: '#ef4444', // red-500
    high: '#f59e0b',     // amber-500
    medium: '#3b82f6',   // blue-500
    low: '#6b7280',      // gray-500
  };
  return colors[priority];
}

export function getPriorityEmoji(priority: Priority): string {
  const emojis = {
    critical: '🚨',
    high: '⚠️',
    medium: '📌',
    low: '📝',
  };
  return emojis[priority];
}

// Work type utilities
export function getWorkTypeIcon(workType: WorkType): string {
  const icons = {
    bug: '🐛',
    documentation: '📖',
    testing: '🧪',
    feature: '✨',
    infrastructure: '🏗️',
    research: '📚',
  };
  return icons[workType];
}

export function getWorkTypeColor(workType: WorkType): string {
  const colors = {
    bug: '#ef4444',          // red-500
    documentation: '#8b5cf6', // violet-500
    testing: '#10b981',       // emerald-500
    feature: '#3b82f6',       // blue-500
    infrastructure: '#6366f1', // indigo-500
    research: '#f59e0b',      // amber-500
  };
  return colors[workType];
}

// String utilities
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Confidence utilities
export function getConfidenceLevel(confidence: number): 'high' | 'medium' | 'low' {
  if (confidence >= 80) return 'high';
  if (confidence >= 50) return 'medium';
  return 'low';
}

export function getConfidenceColor(confidence: number): string {
  const level = getConfidenceLevel(confidence);
  const colors = {
    high: '#10b981',   // emerald-500
    medium: '#f59e0b', // amber-500
    low: '#ef4444',    // red-500
  };
  return colors[level];
}

// Validation utilities
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Debounce utility
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function (...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}