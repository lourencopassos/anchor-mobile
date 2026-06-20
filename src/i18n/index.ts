import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP } from '@config/constants';

// Import all translation files
import enCommon from './locales/en/common.json';
import enAuth from './locales/en/auth.json';
import enCommitments from './locales/en/commitments.json';
import enCheckins from './locales/en/checkins.json';
import enSupporters from './locales/en/supporters.json';
import enNotifications from './locales/en/notifications.json';
import enErrors from './locales/en/errors.json';
import enEvaluations from './locales/en/evaluations.json';
import enHome from './locales/en/home.json';
import enClaim from './locales/en/claim.json';
import enSupporting from './locales/en/supporting.json';
import enSettings from './locales/en/settings.json';
import enInvitation from './locales/en/invitation.json';
import enCustodian from './locales/en/custodian.json';

import ptBRCommon from './locales/pt-BR/common.json';
import ptBRAuth from './locales/pt-BR/auth.json';
import ptBRCommitments from './locales/pt-BR/commitments.json';
import ptBRCheckins from './locales/pt-BR/checkins.json';
import ptBRSupporters from './locales/pt-BR/supporters.json';
import ptBRNotifications from './locales/pt-BR/notifications.json';
import ptBRErrors from './locales/pt-BR/errors.json';
import ptBREvaluations from './locales/pt-BR/evaluations.json';
import ptBRHome from './locales/pt-BR/home.json';
import ptBRClaim from './locales/pt-BR/claim.json';
import ptBRSupporting from './locales/pt-BR/supporting.json';
import ptBRSettings from './locales/pt-BR/settings.json';
import ptBRInvitation from './locales/pt-BR/invitation.json';
import ptBRCustodian from './locales/pt-BR/custodian.json';

const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    commitments: enCommitments,
    checkins: enCheckins,
    supporters: enSupporters,
    notifications: enNotifications,
    errors: enErrors,
    evaluations: enEvaluations,
    home: enHome,
    claim: enClaim,
    supporting: enSupporting,
    settings: enSettings,
    invitation: enInvitation,
    custodian: enCustodian,
  },
  'pt-BR': {
    common: ptBRCommon,
    auth: ptBRAuth,
    commitments: ptBRCommitments,
    checkins: ptBRCheckins,
    supporters: ptBRSupporters,
    notifications: ptBRNotifications,
    errors: ptBRErrors,
    evaluations: ptBREvaluations,
    home: ptBRHome,
    claim: ptBRClaim,
    supporting: ptBRSupporting,
    settings: ptBRSettings,
    invitation: ptBRInvitation,
    custodian: ptBRCustodian,
  },
};

// Get device language or stored preference
export const getInitialLanguage = async (): Promise<string> => {
  try {
    const storedLang = await AsyncStorage.getItem(APP.LANGUAGE_STORAGE_KEY);
    if (storedLang && (storedLang === 'en' || storedLang === 'pt-BR')) {
      return storedLang;
    }
  } catch (e) {
    console.warn('Failed to load language preference');
  }

  // Check device locale
  const deviceLocale = Localization.locale;
  if (deviceLocale.startsWith('pt')) {
    return 'pt-BR';
  }
  return 'en';
};

i18n.use(initReactI18next).init({
  resources,
  lng: APP.DEFAULT_LANGUAGE, // Will be updated after async check
  fallbackLng: 'en',
  supportedLngs: ['en', 'pt-BR'],
  // Use v3 compatibility for Hermes engine (React Native)
  compatibilityJSON: 'v3',
  ns: [
    'common',
    'auth',
    'commitments',
    'checkins',
    'supporters',
    'notifications',
    'errors',
    'evaluations',
    'home',
    'claim',
    'supporting',
    'settings',
    'invitation',
    'custodian',
  ],
  defaultNS: 'common',
  interpolation: {
    escapeValue: false,
  },
});

// Initialize language asynchronously
getInitialLanguage().then((lang) => {
  i18n.changeLanguage(lang);
});

// Export function to change language and persist
export const setLanguage = async (lang: 'en' | 'pt-BR'): Promise<void> => {
  await AsyncStorage.setItem(APP.LANGUAGE_STORAGE_KEY, lang);
  await i18n.changeLanguage(lang);
};

export default i18n;
