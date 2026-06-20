import React, { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n, { getInitialLanguage } from '@i18n/index';

interface I18nProviderProps {
  children: React.ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function initLanguage() {
      const language = await getInitialLanguage();
      await i18n.changeLanguage(language);
      setIsReady(true);
    }

    initLanguage();
  }, []);

  // Show nothing while loading language
  // In a real app, you might show a splash screen
  if (!isReady) {
    return null;
  }

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
