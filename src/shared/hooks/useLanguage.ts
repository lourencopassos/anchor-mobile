import { useTranslation } from 'react-i18next';
import { setLanguage } from '@i18n/index';
import type { SupportedLanguage } from '@i18n/types';

/**
 * Hook for managing app language
 */
export function useLanguage() {
  const { i18n } = useTranslation();

  const currentLanguage = i18n.language as SupportedLanguage;

  const changeLanguage = async (lang: SupportedLanguage) => {
    await setLanguage(lang);
  };

  const toggleLanguage = async () => {
    const newLang: SupportedLanguage =
      currentLanguage === 'en' ? 'pt-BR' : 'en';
    await changeLanguage(newLang);
  };

  return {
    currentLanguage,
    changeLanguage,
    toggleLanguage,
    isPortuguese: currentLanguage === 'pt-BR',
    isEnglish: currentLanguage === 'en',
  };
}
