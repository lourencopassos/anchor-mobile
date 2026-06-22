// Translation key types for type-safe translations
export type SupportedLanguage = 'en' | 'pt-BR';

export type TranslationNamespace =
  | 'common'
  | 'auth'
  | 'commitments'
  | 'checkins'
  | 'supporters'
  | 'notifications'
  | 'errors'
  | 'evaluations'
  | 'supporting'
  | 'home'
  | 'claim'
  | 'invitation'
  | 'custodian';

// Resource types from JSON files
type CommonResources = typeof import('./locales/en/common.json');
type AuthResources = typeof import('./locales/en/auth.json');
type CommitmentsResources = typeof import('./locales/en/commitments.json');
type CheckinsResources = typeof import('./locales/en/checkins.json');
type SupportersResources = typeof import('./locales/en/supporters.json');
type NotificationsResources = typeof import('./locales/en/notifications.json');
type ErrorsResources = typeof import('./locales/en/errors.json');
type EvaluationsResources = typeof import('./locales/en/evaluations.json');
type SupportingResources = typeof import('./locales/en/supporting.json');
type HomeResources = typeof import('./locales/en/home.json');
type ClaimResources = typeof import('./locales/en/claim.json');
type InvitationResources = typeof import('./locales/en/invitation.json');
type CustodianResources = typeof import('./locales/en/custodian.json');

// All resources type for reference
export interface Resources {
  common: CommonResources;
  auth: AuthResources;
  commitments: CommitmentsResources;
  checkins: CheckinsResources;
  supporters: SupportersResources;
  notifications: NotificationsResources;
  errors: ErrorsResources;
  evaluations: EvaluationsResources;
  supporting: SupportingResources;
  home: HomeResources;
  claim: ClaimResources;
  invitation: InvitationResources;
  custodian: CustodianResources;
}

// Extend i18next - use returnNull: false and allowObjectInHTMLChildren for flexibility
// Note: We allow any string keys to support cross-namespace access (e.g., 'common:appName')
declare module 'i18next' {
  interface CustomTypeOptions {
    returnNull: false;
    defaultNS: 'common';
    resources: Resources;
    // Allow any key string to support namespace:key syntax
    allowObjectInHTMLChildren: true;
  }
}

// Extend react-i18next with the same configuration
declare module 'react-i18next' {
  interface CustomTypeOptions {
    returnNull: false;
    defaultNS: 'common';
    resources: Resources;
    allowObjectInHTMLChildren: true;
  }
}
