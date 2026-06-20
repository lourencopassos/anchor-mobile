import {
  format,
  formatDistance,
  formatRelative,
  isToday,
  isYesterday,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  parseISO,
} from 'date-fns';
import { enUS, ptBR } from 'date-fns/locale';
import i18n from '@i18n/index';

// Get the appropriate locale for date-fns
function getLocale() {
  return i18n.language === 'pt-BR' ? ptBR : enUS;
}

/**
 * Format a date string to a readable format
 */
export function formatDate(dateString: string, formatStr = 'PPP'): string {
  try {
    const date = parseISO(dateString);
    return format(date, formatStr, { locale: getLocale() });
  } catch {
    return dateString;
  }
}

/**
 * Format a date as relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(dateString: string): string {
  try {
    const date = parseISO(dateString);
    const now = new Date();

    // Check for today/yesterday
    if (isToday(date)) {
      return i18n.t('today');
    }
    if (isYesterday(date)) {
      return i18n.t('yesterday');
    }

    // Check different time ranges
    const minutesDiff = differenceInMinutes(now, date);
    if (minutesDiff < 1) {
      return i18n.t('justNow');
    }
    if (minutesDiff < 60) {
      return i18n.t('minutesAgo', { count: minutesDiff });
    }

    const hoursDiff = differenceInHours(now, date);
    if (hoursDiff < 24) {
      return i18n.t('hoursAgo', { count: hoursDiff });
    }

    const daysDiff = differenceInDays(now, date);
    if (daysDiff < 30) {
      return i18n.t('daysAgo', { count: daysDiff });
    }

    // Fall back to formatted date
    return formatDate(dateString);
  } catch {
    return dateString;
  }
}

/**
 * Format distance between two dates
 */
export function formatDateDistance(
  startDate: string,
  endDate: string
): string {
  try {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    return formatDistance(start, end, { locale: getLocale() });
  } catch {
    return '';
  }
}

/**
 * Format a date relative to now
 */
export function formatDateRelative(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return formatRelative(date, new Date(), { locale: getLocale() });
  } catch {
    return dateString;
  }
}

/**
 * Calculate days remaining until a date
 */
export function getDaysRemaining(endDateString: string): number {
  try {
    const endDate = parseISO(endDateString);
    const now = new Date();
    return Math.max(0, differenceInDays(endDate, now));
  } catch {
    return 0;
  }
}

/**
 * Check if a date is in the past
 */
export function isPastDate(dateString: string): boolean {
  try {
    const date = parseISO(dateString);
    return date < new Date();
  } catch {
    return false;
  }
}
