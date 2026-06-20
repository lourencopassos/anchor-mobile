import * as Linking from 'expo-linking';

// Deep link prefixes
const prefix = Linking.createURL('/');
const universalLinks = ['https://anchor.app', 'https://www.anchor.app'];

// Expo Router handles linking configuration automatically via file-based routing
// This file provides helper functions for generating and parsing deep links

export const DEEP_LINK_PREFIXES = [prefix, ...universalLinks];

// Helper to generate deep links
export function generateDeepLink(path: string): string {
  return Linking.createURL(path);
}

// Parse notification action URLs
export function parseActionUrl(actionUrl: string): {
  screen: string;
  params?: Record<string, string>;
} | null {
  try {
    const url = new URL(actionUrl, 'anchor://');
    const pathParts = url.pathname.split('/').filter(Boolean);

    if (pathParts[0] === 'commitments' && pathParts[1]) {
      const commitmentId = pathParts[1];
      const subRoute = pathParts[2];

      return {
        screen: `(main)/commitments/${commitmentId}${subRoute ? `/${subRoute}` : ''}`,
        params: { id: commitmentId },
      };
    }

    if (pathParts[0] === 'notifications') {
      return { screen: '(main)/notifications' };
    }

    return null;
  } catch {
    return null;
  }
}

// Route mapping for notification action URLs
export const NOTIFICATION_ROUTES = {
  checkin_reminder: (id: string) => `/commitments/${id}/check-in`,
  vote_request: (id: string) => `/commitments/${id}/supporters`,
  commitment_complete: (id: string) => `/commitments/${id}`,
  supporter_invite: (id: string) => `/commitments/${id}/supporters`,
} as const;
