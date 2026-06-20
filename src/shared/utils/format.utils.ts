import i18n from '@i18n/index';

/**
 * Format cents to currency string
 */
export function formatCurrency(cents: number, currency = 'USD'): string {
  const amount = cents / 100;
  const locale = i18n.language === 'pt-BR' ? 'pt-BR' : 'en-US';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: i18n.language === 'pt-BR' ? 'BRL' : currency,
  }).format(amount);
}

/**
 * Get currency symbol based on current locale
 */
export function getCurrencySymbol(): string {
  return i18n.language === 'pt-BR' ? 'R$' : '$';
}

/**
 * Check if current locale is Brazilian Portuguese
 */
export function isBrazilianLocale(): boolean {
  return i18n.language === 'pt-BR';
}

/**
 * Format a number with locale-specific formatting
 */
export function formatNumber(num: number): string {
  const locale = i18n.language === 'pt-BR' ? 'pt-BR' : 'en-US';
  return new Intl.NumberFormat(locale).format(num);
}

/**
 * Format a percentage (0-1 ratio to percentage string)
 */
export function formatPercentage(ratio: number, decimals = 0): string {
  const percentage = ratio * 100;
  return `${percentage.toFixed(decimals)}%`;
}

/**
 * Format a ratio as a fraction string (e.g., "5 of 7")
 */
export function formatFraction(
  numerator: number,
  denominator: number
): string {
  return `${numerator} / ${denominator}`;
}

/**
 * Truncate a string to a maximum length
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.substring(0, maxLength - 3)}...`;
}

/**
 * Capitalize the first letter of a string
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Format a phone number for display
 */
export function formatPhone(phone: string): string {
  // Simple formatting - in production, use a library like libphonenumber-js
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    // US format: +1 (XXX) XXX-XXXX
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  if (cleaned.length === 11) {
    // BR format: +55 (XX) XXXXX-XXXX
    return `+55 (${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
}
