# Anchor Mobile App - Master Implementation Prompt

## Overview

This document provides a **phased master prompt** for building the Anchor Mobile App from scratch. Each phase corresponds to features already implemented in the backend, ensuring complete mobile-backend parity.

**Tech Stack**: React Native + Expo SDK 51 (LTS) + TypeScript

**Supported Languages**: English (en) and Portuguese - Brazil (pt-BR)

---

# MASTER PROMPT

Copy and use this prompt to initialize the anchor-mobile repository. Execute phases sequentially.

---

## Phase 0: Project Foundation

```
Create a new React Native mobile app called "Anchor" using Expo SDK 51 with the following specifications:

## Project Overview
Anchor is a behavioral commitment-tracking app where users create personal commitments backed by real financial stakes. Users track daily progress, invite supporters for accountability, and receive supportive notifications.

## Supported Languages
The app must support two languages from day one:
- **English (en)** - Default language
- **Portuguese - Brazil (pt-BR)** - Secondary language

Use expo-localization for device language detection and i18next + react-i18next for translations.

## Technology Stack
- Expo SDK 51 (LTS)
- React Native 0.73+
- TypeScript 5.3+
- Expo Router 3.x for file-based navigation
- TanStack Query 5.x for server state management
- Zustand 4.x for client state management
- NativeWind 4.x (Tailwind CSS for React Native)
- expo-secure-store for secure token storage
- expo-notifications for push notifications
- expo-local-authentication for biometrics
- expo-localization for device locale detection
- i18next + react-i18next for internationalization
- axios for HTTP requests
- date-fns for date manipulation
- zod for runtime validation

## Project Structure
Create this exact folder structure:

anchor-mobile/
├── app/                            # Expo Router screens
│   ├── (auth)/                     # Authentication stack (Phase 1)
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   ├── (main)/                     # Authenticated stack with tabs
│   │   ├── _layout.tsx             # Tab navigator
│   │   ├── index.tsx               # Dashboard/Home
│   │   ├── commitments/            # Phase 2
│   │   │   ├── index.tsx           # Commitment list
│   │   │   ├── [id]/
│   │   │   │   ├── index.tsx       # Detail view
│   │   │   │   ├── check-in.tsx    # Phase 3
│   │   │   │   ├── supporters.tsx  # Phase 4
│   │   │   │   └── progress.tsx    # Phase 5
│   │   │   └── create.tsx          # Create wizard
│   │   ├── notifications.tsx       # Phase 6
│   │   └── profile.tsx
│   ├── _layout.tsx                 # Root layout with providers
│   └── index.tsx                   # Entry redirect
├── src/
│   ├── api/
│   │   ├── client.ts               # Axios instance
│   │   ├── endpoints/
│   │   │   ├── auth.api.ts
│   │   │   ├── commitments.api.ts
│   │   │   ├── check-ins.api.ts
│   │   │   ├── supporters.api.ts
│   │   │   └── notifications.api.ts
│   │   └── types/
│   │       ├── index.ts            # Export all types
│   │       ├── auth.types.ts
│   │       ├── commitment.types.ts
│   │       ├── checkin.types.ts
│   │       ├── supporter.types.ts
│   │       ├── evaluation.types.ts
│   │       └── notification.types.ts
│   ├── features/
│   │   ├── auth/
│   │   │   ├── hooks/
│   │   │   │   ├── useAuth.ts
│   │   │   │   ├── useLogin.ts
│   │   │   │   ├── useRegister.ts
│   │   │   │   └── useBiometricAuth.ts
│   │   │   ├── stores/
│   │   │   │   └── auth.store.ts
│   │   │   ├── services/
│   │   │   │   └── token.service.ts
│   │   │   └── components/
│   │   │       └── BiometricPrompt.tsx
│   │   ├── commitments/
│   │   │   ├── hooks/
│   │   │   │   ├── useCommitments.ts
│   │   │   │   ├── useCommitment.ts
│   │   │   │   ├── useCreateCommitment.ts
│   │   │   │   └── useRestartCommitment.ts
│   │   │   └── components/
│   │   │       ├── CommitmentCard.tsx
│   │   │       ├── CommitmentStatus.tsx
│   │   │       ├── ProgressRing.tsx
│   │   │       └── TemplateSelector.tsx
│   │   ├── check-ins/
│   │   │   ├── hooks/
│   │   │   │   ├── useCheckIns.ts
│   │   │   │   ├── useSubmitCheckIn.ts
│   │   │   │   └── useCheckInHistory.ts
│   │   │   ├── stores/
│   │   │   │   └── pending-checkins.store.ts
│   │   │   └── components/
│   │   │       ├── CheckInButton.tsx
│   │   │       ├── CheckInCalendar.tsx
│   │   │       └── CheckInStreak.tsx
│   │   ├── supporters/
│   │   │   ├── hooks/
│   │   │   │   ├── useSupporters.ts
│   │   │   │   ├── useInviteSupporter.ts
│   │   │   │   ├── useRespondToInvite.ts
│   │   │   │   └── useCastVote.ts
│   │   │   └── components/
│   │   │       ├── SupporterList.tsx
│   │   │       ├── InviteSupporterModal.tsx
│   │   │       └── VotingPanel.tsx
│   │   ├── evaluations/
│   │   │   ├── hooks/
│   │   │   │   └── useEvaluation.ts
│   │   │   └── components/
│   │   │       ├── MetricsCard.tsx
│   │   │       ├── TrendIndicator.tsx
│   │   │       └── ProgressChart.tsx
│   │   └── notifications/
│   │       ├── hooks/
│   │       │   ├── useNotifications.ts
│   │       │   ├── usePushNotifications.ts
│   │       │   └── useNotificationInbox.ts
│   │       ├── services/
│   │       │   ├── push-notification.service.ts
│   │       │   └── local-notification.service.ts
│   │       └── components/
│   │           ├── NotificationBadge.tsx
│   │           └── NotificationItem.tsx
│   ├── shared/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Toast.tsx
│   │   │   │   ├── LoadingSpinner.tsx
│   │   │   │   └── Badge.tsx
│   │   │   ├── layout/
│   │   │   │   ├── SafeScreen.tsx
│   │   │   │   └── Header.tsx
│   │   │   └── feedback/
│   │   │       ├── ErrorBoundary.tsx
│   │   │       └── EmptyState.tsx
│   │   ├── hooks/
│   │   │   ├── useAppState.ts
│   │   │   ├── useNetworkStatus.ts
│   │   │   └── useDebounce.ts
│   │   └── utils/
│   │       ├── date.utils.ts
│   │       ├── format.utils.ts
│   │       └── storage.utils.ts
│   ├── config/
│   │   ├── env.ts
│   │   ├── constants.ts
│   │   └── theme.ts
│   ├── i18n/
│   │   ├── index.ts              # i18next configuration
│   │   ├── locales/
│   │   │   ├── en/
│   │   │   │   ├── common.json   # Shared translations
│   │   │   │   ├── auth.json     # Authentication screens
│   │   │   │   ├── commitments.json
│   │   │   │   ├── checkins.json
│   │   │   │   ├── supporters.json
│   │   │   │   ├── notifications.json
│   │   │   │   └── errors.json
│   │   │   └── pt-BR/
│   │   │       ├── common.json
│   │   │       ├── auth.json
│   │   │       ├── commitments.json
│   │   │       ├── checkins.json
│   │   │       ├── supporters.json
│   │   │       ├── notifications.json
│   │   │       └── errors.json
│   │   └── types.ts              # Translation key types
│   ├── providers/
│   │   ├── AuthProvider.tsx
│   │   ├── QueryProvider.tsx
│   │   ├── ThemeProvider.tsx
│   │   ├── I18nProvider.tsx      # Internationalization provider
│   │   └── NotificationProvider.tsx
│   └── navigation/
│       ├── linking.ts
│       └── types.ts
├── assets/
│   ├── images/
│   └── icons/
├── app.json
├── eas.json
├── babel.config.js
├── metro.config.js
├── tailwind.config.js
├── tsconfig.json
├── .env.example
└── package.json

## Configuration Files to Create

### package.json
Include these dependencies:
- expo: ~51.0.0
- expo-router: ~3.5.0
- react-native: 0.74.x
- typescript: ^5.3.0
- @tanstack/react-query: ^5.0.0
- zustand: ^4.5.0
- nativewind: ^4.0.0
- tailwindcss: ^3.4.0
- axios: ^1.6.0
- expo-secure-store: ~13.0.0
- expo-local-authentication: ~14.0.0
- expo-notifications: ~0.28.0
- expo-linking: ~6.3.0
- expo-localization: ~15.0.0
- i18next: ^23.0.0
- react-i18next: ^14.0.0
- @react-native-async-storage/async-storage: 1.23.1
- date-fns: ^3.0.0
- zod: ^3.22.0

### app.json
Configure:
- name: "Anchor"
- slug: "anchor"
- scheme: "anchor" (for deep linking)
- iOS and Android bundle IDs
- Notification permissions
- Background modes for notifications

### tsconfig.json
Enable strict mode with path aliases:
- @/* -> src/*
- @api/* -> src/api/*
- @features/* -> src/features/*
- @shared/* -> src/shared/*
- @config/* -> src/config/*
- @i18n/* -> src/i18n/*

### tailwind.config.js
Use this color palette:
- primary: #4CAF50 (green - trust/growth)
- neutral grays: #FAFAFA to #212121
- semantic: success (#4CAF50), warning (#FF9800), error (#F44336), info (#2196F3)

Commitment state colors:
- draft: #9E9E9E (gray)
- active: #4CAF50 (green)
- completed: #2196F3 (blue)
- broken: #F44336 (red)

## Files to Implement for Phase 0

1. All configuration files (package.json, app.json, tsconfig.json, tailwind.config.js, babel.config.js, metro.config.js)
2. src/config/env.ts - Environment configuration with API_URL
3. src/config/theme.ts - Theme constants
4. src/config/constants.ts - App constants (stake limits, etc.)
5. src/api/types/*.ts - All API types (see Type Definitions below)
6. src/api/client.ts - Axios instance with interceptors
7. src/features/auth/services/token.service.ts - Secure token management
8. src/features/auth/stores/auth.store.ts - Auth state with Zustand
9. src/providers/QueryProvider.tsx - TanStack Query setup
10. src/providers/AuthProvider.tsx - Auth context
11. src/providers/I18nProvider.tsx - Internationalization setup
12. src/i18n/index.ts - i18next configuration
13. src/i18n/locales/en/*.json - English translations
14. src/i18n/locales/pt-BR/*.json - Portuguese (Brazil) translations
15. src/shared/components/ui/*.tsx - Basic UI components
16. app/_layout.tsx - Root layout with all providers (including I18nProvider)
17. app/index.tsx - Entry redirect based on auth state

Create placeholder files for all other directories with TODO comments.

## Internationalization Setup

### src/i18n/index.ts
```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import all translation files
import enCommon from './locales/en/common.json';
import enAuth from './locales/en/auth.json';
import enCommitments from './locales/en/commitments.json';
import enCheckins from './locales/en/checkins.json';
import enSupporters from './locales/en/supporters.json';
import enNotifications from './locales/en/notifications.json';
import enErrors from './locales/en/errors.json';

import ptBRCommon from './locales/pt-BR/common.json';
import ptBRAuth from './locales/pt-BR/auth.json';
import ptBRCommitments from './locales/pt-BR/commitments.json';
import ptBRCheckins from './locales/pt-BR/checkins.json';
import ptBRSupporters from './locales/pt-BR/supporters.json';
import ptBRNotifications from './locales/pt-BR/notifications.json';
import ptBRErrors from './locales/pt-BR/errors.json';

const LANGUAGE_STORAGE_KEY = '@anchor/language';

const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    commitments: enCommitments,
    checkins: enCheckins,
    supporters: enSupporters,
    notifications: enNotifications,
    errors: enErrors,
  },
  'pt-BR': {
    common: ptBRCommon,
    auth: ptBRAuth,
    commitments: ptBRCommitments,
    checkins: ptBRCheckins,
    supporters: ptBRSupporters,
    notifications: ptBRNotifications,
    errors: ptBRErrors,
  },
};

// Get device language or stored preference
const getInitialLanguage = async (): Promise<string> => {
  try {
    const storedLang = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
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

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // Will be updated after async check
    fallbackLng: 'en',
    supportedLngs: ['en', 'pt-BR'],
    ns: ['common', 'auth', 'commitments', 'checkins', 'supporters', 'notifications', 'errors'],
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
export const setLanguage = async (lang: 'en' | 'pt-BR') => {
  await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  await i18n.changeLanguage(lang);
};

export default i18n;
```

### Language Switcher Hook (src/shared/hooks/useLanguage.ts)
```typescript
import { useTranslation } from 'react-i18next';
import { setLanguage } from '@i18n/index';

export const useLanguage = () => {
  const { i18n } = useTranslation();

  const currentLanguage = i18n.language as 'en' | 'pt-BR';

  const changeLanguage = async (lang: 'en' | 'pt-BR') => {
    await setLanguage(lang);
  };

  const toggleLanguage = async () => {
    const newLang = currentLanguage === 'en' ? 'pt-BR' : 'en';
    await changeLanguage(newLang);
  };

  return {
    currentLanguage,
    changeLanguage,
    toggleLanguage,
    isPortuguese: currentLanguage === 'pt-BR',
    isEnglish: currentLanguage === 'en',
  };
};
```

## Translation Files Reference

### English (en/common.json)
```json
{
  "appName": "Anchor",
  "loading": "Loading...",
  "save": "Save",
  "cancel": "Cancel",
  "delete": "Delete",
  "edit": "Edit",
  "confirm": "Confirm",
  "back": "Back",
  "next": "Next",
  "done": "Done",
  "retry": "Try Again",
  "refresh": "Refresh",
  "search": "Search",
  "noResults": "No results found",
  "offline": "You're offline",
  "online": "Back online",
  "settings": "Settings",
  "profile": "Profile",
  "language": "Language",
  "english": "English",
  "portuguese": "Portuguese (Brazil)",
  "today": "Today",
  "yesterday": "Yesterday",
  "daysAgo": "{{count}} days ago",
  "hoursAgo": "{{count}} hours ago",
  "minutesAgo": "{{count}} minutes ago",
  "justNow": "Just now"
}
```

### Portuguese (pt-BR/common.json)
```json
{
  "appName": "Anchor",
  "loading": "Carregando...",
  "save": "Salvar",
  "cancel": "Cancelar",
  "delete": "Excluir",
  "edit": "Editar",
  "confirm": "Confirmar",
  "back": "Voltar",
  "next": "Próximo",
  "done": "Concluído",
  "retry": "Tentar Novamente",
  "refresh": "Atualizar",
  "search": "Buscar",
  "noResults": "Nenhum resultado encontrado",
  "offline": "Você está offline",
  "online": "De volta online",
  "settings": "Configurações",
  "profile": "Perfil",
  "language": "Idioma",
  "english": "Inglês",
  "portuguese": "Português (Brasil)",
  "today": "Hoje",
  "yesterday": "Ontem",
  "daysAgo": "{{count}} dias atrás",
  "hoursAgo": "{{count}} horas atrás",
  "minutesAgo": "{{count}} minutos atrás",
  "justNow": "Agora mesmo"
}
```

### English (en/auth.json)
```json
{
  "login": "Log In",
  "register": "Sign Up",
  "logout": "Log Out",
  "email": "Email",
  "password": "Password",
  "confirmPassword": "Confirm Password",
  "phone": "Phone (optional)",
  "forgotPassword": "Forgot Password?",
  "noAccount": "Don't have an account?",
  "haveAccount": "Already have an account?",
  "rememberMe": "Remember me",
  "biometricLogin": "Log in with biometrics",
  "biometricPrompt": "Authenticate to continue",
  "termsAccept": "I accept the Terms of Service and Privacy Policy",
  "passwordStrength": {
    "weak": "Weak",
    "fair": "Fair",
    "good": "Good",
    "strong": "Strong"
  },
  "errors": {
    "invalidEmail": "Please enter a valid email address",
    "passwordTooShort": "Password must be at least 8 characters",
    "passwordMismatch": "Passwords do not match",
    "loginFailed": "Login failed. Please check your credentials.",
    "registerFailed": "Registration failed. Please try again.",
    "biometricFailed": "Biometric authentication failed"
  }
}
```

### Portuguese (pt-BR/auth.json)
```json
{
  "login": "Entrar",
  "register": "Cadastrar",
  "logout": "Sair",
  "email": "E-mail",
  "password": "Senha",
  "confirmPassword": "Confirmar Senha",
  "phone": "Telefone (opcional)",
  "forgotPassword": "Esqueceu a senha?",
  "noAccount": "Não tem uma conta?",
  "haveAccount": "Já tem uma conta?",
  "rememberMe": "Lembrar de mim",
  "biometricLogin": "Entrar com biometria",
  "biometricPrompt": "Autentique-se para continuar",
  "termsAccept": "Aceito os Termos de Serviço e a Política de Privacidade",
  "passwordStrength": {
    "weak": "Fraca",
    "fair": "Regular",
    "good": "Boa",
    "strong": "Forte"
  },
  "errors": {
    "invalidEmail": "Por favor, insira um e-mail válido",
    "passwordTooShort": "A senha deve ter pelo menos 8 caracteres",
    "passwordMismatch": "As senhas não coincidem",
    "loginFailed": "Falha no login. Verifique suas credenciais.",
    "registerFailed": "Falha no cadastro. Tente novamente.",
    "biometricFailed": "Falha na autenticação biométrica"
  }
}
```

### English (en/commitments.json)
```json
{
  "title": "Commitments",
  "myCommitments": "My Commitments",
  "createNew": "Create New Commitment",
  "noCommitments": "You don't have any commitments yet",
  "startJourney": "Start your journey",
  "filter": {
    "all": "All",
    "active": "Active",
    "completed": "Completed",
    "failed": "Failed"
  },
  "state": {
    "draft": "Draft",
    "active": "Active",
    "completed": "Completed",
    "broken": "Broken",
    "cancelled": "Cancelled"
  },
  "templates": {
    "quit_smoking": "Quit Smoking",
    "exercise": "Exercise",
    "meditation": "Meditation",
    "diet": "Diet",
    "sleep": "Sleep",
    "custom": "Custom"
  },
  "wizard": {
    "step1": "Choose Template",
    "step2": "Set Dates",
    "step3": "Set Stake",
    "step4": "Distribution",
    "step5": "Review",
    "startDate": "Start Date",
    "endDate": "End Date",
    "stakeAmount": "Stake Amount",
    "stakeRange": "$5 - $1,000",
    "charityPercent": "Charity %",
    "supportersPercent": "Supporters %",
    "reviewTitle": "Review Your Commitment",
    "createCommitment": "Create Commitment"
  },
  "detail": {
    "progress": "Progress",
    "supporters": "Supporters",
    "history": "History",
    "checkIn": "Check In",
    "currentCycle": "Current Cycle",
    "daysRemaining": "{{count}} days remaining",
    "restart": "Restart Commitment",
    "cannotRestart": "Cannot restart this commitment"
  },
  "restart": {
    "title": "Restart Commitment",
    "selectMode": "Select Recovery Mode",
    "fullReset": "Full Reset",
    "fullResetDesc": "Start completely fresh with new dates and stake",
    "sameRules": "Same Rules",
    "sameRulesDesc": "Keep the same stake and rules, just new dates",
    "adjusted": "Adjusted Retry",
    "adjustedDesc": "Modify stake or rules for this attempt"
  }
}
```

### Portuguese (pt-BR/commitments.json)
```json
{
  "title": "Compromissos",
  "myCommitments": "Meus Compromissos",
  "createNew": "Criar Novo Compromisso",
  "noCommitments": "Você ainda não tem compromissos",
  "startJourney": "Comece sua jornada",
  "filter": {
    "all": "Todos",
    "active": "Ativos",
    "completed": "Concluídos",
    "failed": "Falhos"
  },
  "state": {
    "draft": "Rascunho",
    "active": "Ativo",
    "completed": "Concluído",
    "broken": "Quebrado",
    "cancelled": "Cancelado"
  },
  "templates": {
    "quit_smoking": "Parar de Fumar",
    "exercise": "Exercício",
    "meditation": "Meditação",
    "diet": "Dieta",
    "sleep": "Sono",
    "custom": "Personalizado"
  },
  "wizard": {
    "step1": "Escolher Modelo",
    "step2": "Definir Datas",
    "step3": "Definir Aposta",
    "step4": "Distribuição",
    "step5": "Revisar",
    "startDate": "Data de Início",
    "endDate": "Data de Término",
    "stakeAmount": "Valor da Aposta",
    "stakeRange": "R$25 - R$5.000",
    "charityPercent": "% para Caridade",
    "supportersPercent": "% para Apoiadores",
    "reviewTitle": "Revise Seu Compromisso",
    "createCommitment": "Criar Compromisso"
  },
  "detail": {
    "progress": "Progresso",
    "supporters": "Apoiadores",
    "history": "Histórico",
    "checkIn": "Registrar",
    "currentCycle": "Ciclo Atual",
    "daysRemaining": "{{count}} dias restantes",
    "restart": "Reiniciar Compromisso",
    "cannotRestart": "Não é possível reiniciar este compromisso"
  },
  "restart": {
    "title": "Reiniciar Compromisso",
    "selectMode": "Selecione o Modo de Recuperação",
    "fullReset": "Reinício Total",
    "fullResetDesc": "Começar do zero com novas datas e aposta",
    "sameRules": "Mesmas Regras",
    "sameRulesDesc": "Manter a mesma aposta e regras, apenas novas datas",
    "adjusted": "Tentativa Ajustada",
    "adjustedDesc": "Modificar aposta ou regras para esta tentativa"
  }
}
```

### English (en/checkins.json)
```json
{
  "title": "Check-In",
  "checkInToday": "Check in for today",
  "alreadyCheckedIn": "You've already checked in today",
  "pendingSync": "Pending sync",
  "status": {
    "completed": "Completed",
    "skipped": "Skipped",
    "missed": "Missed"
  },
  "evidenceType": {
    "selfReport": "Self Report",
    "photo": "Photo Evidence",
    "manual": "Manual Entry"
  },
  "notes": "Notes (optional)",
  "notesPlaceholder": "How did it go today?",
  "submit": "Submit Check-In",
  "success": "Check-in recorded!",
  "streak": {
    "current": "Current Streak",
    "longest": "Longest Streak",
    "days": "{{count}} days",
    "personalBest": "Personal Best!"
  },
  "calendar": {
    "title": "Check-In History",
    "tapToView": "Tap a day to view details"
  },
  "offline": {
    "title": "You're offline",
    "message": "Your check-in will be saved and synced when you're back online"
  }
}
```

### Portuguese (pt-BR/checkins.json)
```json
{
  "title": "Registro",
  "checkInToday": "Registrar hoje",
  "alreadyCheckedIn": "Você já registrou hoje",
  "pendingSync": "Sincronização pendente",
  "status": {
    "completed": "Concluído",
    "skipped": "Pulado",
    "missed": "Perdido"
  },
  "evidenceType": {
    "selfReport": "Auto-relato",
    "photo": "Foto como Evidência",
    "manual": "Entrada Manual"
  },
  "notes": "Notas (opcional)",
  "notesPlaceholder": "Como foi hoje?",
  "submit": "Enviar Registro",
  "success": "Registro salvo!",
  "streak": {
    "current": "Sequência Atual",
    "longest": "Maior Sequência",
    "days": "{{count}} dias",
    "personalBest": "Recorde Pessoal!"
  },
  "calendar": {
    "title": "Histórico de Registros",
    "tapToView": "Toque em um dia para ver detalhes"
  },
  "offline": {
    "title": "Você está offline",
    "message": "Seu registro será salvo e sincronizado quando você voltar a ficar online"
  }
}
```

### English (en/supporters.json)
```json
{
  "title": "Supporters",
  "invite": "Invite Supporter",
  "noSupporters": "No supporters yet",
  "inviteFirst": "Invite someone to support your journey",
  "role": {
    "observer": "Observer",
    "observerDesc": "Can view your progress",
    "encourager": "Encourager",
    "encouragerDesc": "Can send you messages",
    "verifier": "Verifier",
    "verifierDesc": "Can vote on commitment status"
  },
  "state": {
    "invited": "Invited",
    "active": "Active",
    "declined": "Declined",
    "removed": "Removed"
  },
  "inviteModal": {
    "title": "Invite a Supporter",
    "emailOrPhone": "Email or Phone",
    "selectRole": "Select Role",
    "send": "Send Invitation"
  },
  "voting": {
    "title": "Voting Status",
    "votesReceived": "{{received}} of {{required}} votes received",
    "castVote": "Cast Your Vote",
    "voteTypes": {
      "fail": "Vote Fail",
      "abstain": "Abstain"
    },
    "reason": "Reason (optional)",
    "reasonPlaceholder": "Why are you voting this way?",
    "alreadyVoted": "You have already voted",
    "submitVote": "Submit Vote"
  },
  "invitation": {
    "received": "You've been invited to support someone",
    "accept": "Accept",
    "decline": "Decline"
  }
}
```

### Portuguese (pt-BR/supporters.json)
```json
{
  "title": "Apoiadores",
  "invite": "Convidar Apoiador",
  "noSupporters": "Nenhum apoiador ainda",
  "inviteFirst": "Convide alguém para apoiar sua jornada",
  "role": {
    "observer": "Observador",
    "observerDesc": "Pode ver seu progresso",
    "encourager": "Incentivador",
    "encouragerDesc": "Pode enviar mensagens",
    "verifier": "Verificador",
    "verifierDesc": "Pode votar no status do compromisso"
  },
  "state": {
    "invited": "Convidado",
    "active": "Ativo",
    "declined": "Recusado",
    "removed": "Removido"
  },
  "inviteModal": {
    "title": "Convidar um Apoiador",
    "emailOrPhone": "E-mail ou Telefone",
    "selectRole": "Selecionar Função",
    "send": "Enviar Convite"
  },
  "voting": {
    "title": "Status da Votação",
    "votesReceived": "{{received}} de {{required}} votos recebidos",
    "castVote": "Registrar Seu Voto",
    "voteTypes": {
      "fail": "Votar Falha",
      "abstain": "Abster-se"
    },
    "reason": "Motivo (opcional)",
    "reasonPlaceholder": "Por que você está votando assim?",
    "alreadyVoted": "Você já votou",
    "submitVote": "Enviar Voto"
  },
  "invitation": {
    "received": "Você foi convidado a apoiar alguém",
    "accept": "Aceitar",
    "decline": "Recusar"
  }
}
```

### English (en/notifications.json) - NON-PUNITIVE COPY
```json
{
  "title": "Notifications",
  "markAllRead": "Mark all as read",
  "noNotifications": "No notifications yet",
  "unread": "{{count}} unread",
  "types": {
    "commitment_activated": {
      "title": "Your commitment is now active",
      "body": "Good luck with '{{commitmentName}}'! Your {{durationDays}}-day journey begins today. Your supporters are cheering you on."
    },
    "commitment_restarted": {
      "title": "A new chapter begins",
      "body": "You've started fresh with '{{commitmentName}}'. Every restart is a choice to keep going. Your supporters have been invited to join you again."
    },
    "checkin_missed": {
      "title": "A day without a check-in",
      "body": "Yesterday passed without recording progress on '{{commitmentName}}'. Would you like to reflect on what happened?"
    },
    "evaluation_summary": {
      "title": "Your week in review",
      "body": "This week: {{completedCount}} check-ins completed out of {{totalDays}} days. Current streak: {{streakCurrent}} days."
    },
    "supporter_invited": {
      "title": "You've been invited to support someone",
      "body": "{{inviterName}} has asked you to be a supporter for their commitment '{{commitmentName}}'. Your support can make a real difference."
    },
    "vote_received": {
      "title": "A supporter shared their perspective",
      "body": "One of your supporters has voted on '{{commitmentName}}'. Check in to see how your support team is feeling about your progress."
    },
    "failure_threshold": {
      "title": "Your commitment needs attention",
      "body": "Your supporters have raised concerns about '{{commitmentName}}'. This might be a good moment to reconnect with why this matters to you."
    }
  }
}
```

### Portuguese (pt-BR/notifications.json) - NON-PUNITIVE COPY
```json
{
  "title": "Notificações",
  "markAllRead": "Marcar todas como lidas",
  "noNotifications": "Nenhuma notificação ainda",
  "unread": "{{count}} não lidas",
  "types": {
    "commitment_activated": {
      "title": "Seu compromisso está ativo",
      "body": "Boa sorte com '{{commitmentName}}'! Sua jornada de {{durationDays}} dias começa hoje. Seus apoiadores estão torcendo por você."
    },
    "commitment_restarted": {
      "title": "Um novo capítulo começa",
      "body": "Você recomeçou '{{commitmentName}}'. Cada recomeço é uma escolha de continuar. Seus apoiadores foram convidados a se juntar a você novamente."
    },
    "checkin_missed": {
      "title": "Um dia sem registro",
      "body": "Ontem passou sem registrar progresso em '{{commitmentName}}'. Gostaria de refletir sobre o que aconteceu?"
    },
    "evaluation_summary": {
      "title": "Sua semana em revisão",
      "body": "Esta semana: {{completedCount}} registros concluídos de {{totalDays}} dias. Sequência atual: {{streakCurrent}} dias."
    },
    "supporter_invited": {
      "title": "Você foi convidado a apoiar alguém",
      "body": "{{inviterName}} pediu que você seja apoiador do compromisso '{{commitmentName}}'. Seu apoio pode fazer uma grande diferença."
    },
    "vote_received": {
      "title": "Um apoiador compartilhou sua perspectiva",
      "body": "Um dos seus apoiadores votou em '{{commitmentName}}'. Confira como sua equipe de apoio está se sentindo sobre seu progresso."
    },
    "failure_threshold": {
      "title": "Seu compromisso precisa de atenção",
      "body": "Seus apoiadores levantaram preocupações sobre '{{commitmentName}}'. Este pode ser um bom momento para reconectar-se com o porquê isso é importante para você."
    }
  }
}
```

### English (en/errors.json)
```json
{
  "generic": "Something went wrong. Please try again.",
  "network": "Network error. Please check your connection.",
  "timeout": "Request timed out. Please try again.",
  "unauthorized": "Your session has expired. Please log in again.",
  "forbidden": "You don't have permission to do this.",
  "notFound": "The requested resource was not found.",
  "validation": "Please check your input and try again.",
  "server": "Server error. Please try again later.",
  "offline": "You're offline. This action requires an internet connection."
}
```

### Portuguese (pt-BR/errors.json)
```json
{
  "generic": "Algo deu errado. Por favor, tente novamente.",
  "network": "Erro de rede. Verifique sua conexão.",
  "timeout": "A requisição expirou. Tente novamente.",
  "unauthorized": "Sua sessão expirou. Faça login novamente.",
  "forbidden": "Você não tem permissão para fazer isso.",
  "notFound": "O recurso solicitado não foi encontrado.",
  "validation": "Verifique seus dados e tente novamente.",
  "server": "Erro no servidor. Tente novamente mais tarde.",
  "offline": "Você está offline. Esta ação requer conexão com a internet."
}
```
```

---

## Phase 1: Authentication

```
## Phase 1: Authentication

Implement complete authentication flow for the Anchor mobile app.

### Backend API Endpoints
- POST /auth/register - Create account
  Request: { email: string, password: string, phone?: string }
  Response: { accessToken, refreshToken, expiresIn }

- POST /auth/login - Authenticate
  Request: { email: string, password: string }
  Response: { accessToken, refreshToken, expiresIn }

- POST /auth/refresh - Refresh tokens
  Request: { refreshToken: string }
  Response: { accessToken, refreshToken, expiresIn }

- POST /auth/logout - Revoke tokens
  Headers: Authorization: Bearer <accessToken>
  Response: 204 No Content

### Files to Implement

1. src/api/endpoints/auth.api.ts
   - login(email, password): Promise<TokenPair>
   - register(email, password, phone?): Promise<TokenPair>
   - refreshTokens(refreshToken): Promise<TokenPair>
   - logout(): Promise<void>

2. src/features/auth/services/token.service.ts
   - Store tokens in expo-secure-store
   - getAccessToken(): Promise<string | null>
   - setTokens(tokens: TokenPair): Promise<void>
   - refreshTokens(): Promise<TokenPair> (with mutex to prevent concurrent refreshes)
   - clearTokens(): Promise<void>
   - hasValidTokens(): Promise<boolean>

3. src/features/auth/stores/auth.store.ts (Zustand)
   - user: AuthenticatedUser | null
   - isAuthenticated: boolean
   - isLoading: boolean
   - setUser(user): void
   - logout(): void
   Persist user to AsyncStorage

4. src/features/auth/hooks/useAuth.ts
   - Combine auth store with token service
   - Handle login/logout flows
   - Parse JWT to extract user info

5. src/features/auth/hooks/useLogin.ts
   - TanStack Query mutation for login
   - Optimistic updates
   - Error handling

6. src/features/auth/hooks/useRegister.ts
   - TanStack Query mutation for registration
   - Email/password validation with zod

7. src/features/auth/hooks/useBiometricAuth.ts
   - Check biometric availability
   - Enable/disable biometric login
   - Authenticate with biometrics

8. src/api/client.ts (update)
   - Request interceptor: Add Bearer token
   - Response interceptor: Handle 401, trigger token refresh
   - Add X-Correlation-ID header for tracing

9. app/(auth)/_layout.tsx
   - Stack navigator for auth screens
   - Redirect to main if authenticated

10. app/(auth)/login.tsx
    - Email/password form
    - "Remember me" checkbox
    - Biometric login option
    - Link to register

11. app/(auth)/register.tsx
    - Email/password/phone form
    - Password strength indicator
    - Terms acceptance
    - Link to login

12. app/(main)/_layout.tsx
    - Tab navigator with icons
    - Tabs: Home, Commitments, Notifications, Profile
    - Redirect to auth if not authenticated

### Validation Rules
- Email: Valid email format
- Password: 8-128 characters
- Phone: E.164 format (optional)

### Test Scenarios
- Successful login -> Navigate to home
- Failed login -> Show error toast
- Token expired -> Automatic refresh
- Refresh failed -> Logout and redirect to login
- Biometric enabled -> Show biometric prompt on app open
```

---

## Phase 2: Commitments

```
## Phase 2: Commitments

Implement commitment creation, viewing, and management.

### Backend API Endpoints
- GET /api/v1/commitments - List user's commitments
  Response: Commitment[]

- POST /api/v1/commitments - Create commitment
  Headers: X-Idempotency-Key: UUID (required)
  Request: CreateCommitmentRequest
  Response: { id, state: "DRAFT", message }

- GET /api/v1/commitments/:id - Get commitment details
  Response: Commitment

- GET /api/v1/commitments/:id/restart-eligibility - Check if can restart
  Response: { canRestart, reason?, lastCycleStatus?, totalCycles }

- POST /api/v1/commitments/:id/restart - Restart failed commitment
  Request: RestartCommitmentRequest
  Response: { commitmentId, cycleId, cycleNumber, state, message }

- GET /api/v1/commitments/:id/cycles - Get cycle history
  Response: CycleHistoryItem[]

### Files to Implement

1. src/api/endpoints/commitments.api.ts
   - list(): Promise<Commitment[]>
   - get(id): Promise<Commitment>
   - create(request, idempotencyKey): Promise<{ id, state }>
   - checkRestartEligibility(id): Promise<RestartEligibility>
   - restart(id, request): Promise<{ commitmentId, cycleId }>
   - getCycles(id): Promise<CycleHistoryItem[]>

2. src/features/commitments/hooks/useCommitments.ts
   - TanStack Query for commitment list
   - Query key: ['commitments']
   - Stale time: 5 minutes
   - Refetch on window focus

3. src/features/commitments/hooks/useCommitment.ts
   - TanStack Query for single commitment
   - Query key: ['commitments', id]
   - Include cycle history

4. src/features/commitments/hooks/useCreateCommitment.ts
   - TanStack Mutation
   - Generate idempotency key
   - Invalidate list on success
   - Multi-step wizard state

5. src/features/commitments/hooks/useRestartCommitment.ts
   - TanStack Mutation
   - Check eligibility first
   - Invalidate commitment and list on success

6. src/features/commitments/components/CommitmentCard.tsx
   - Display commitment summary
   - Show state badge with color
   - Progress indicator
   - Quick actions (check-in, view)

7. src/features/commitments/components/CommitmentStatus.tsx
   - State badge (DRAFT, ACTIVE, etc.)
   - Color-coded by state
   - Optional tooltip with details

8. src/features/commitments/components/ProgressRing.tsx
   - Circular progress indicator
   - Show completion percentage
   - Animated fill

9. src/features/commitments/components/TemplateSelector.tsx
   - Grid of commitment templates
   - QUIT_SMOKING, EXERCISE, MEDITATION, DIET, SLEEP, CUSTOM
   - Icon and description for each

10. app/(main)/commitments/index.tsx
    - List of user's commitments
    - Filter tabs: All, Active, Completed, Failed
    - FAB to create new
    - Pull to refresh
    - Empty state

11. app/(main)/commitments/[id]/index.tsx
    - Commitment detail view
    - Header with status and progress
    - Current cycle info
    - Quick check-in button
    - Sections: Progress, Supporters, History
    - Restart button if failed

12. app/(main)/commitments/create.tsx
    - Multi-step wizard:
      1. Select template
      2. Configure dates (start/end)
      3. Set stake amount ($5-$1000)
      4. Distribution config (charity/supporters split)
      5. Review and confirm
    - Progress indicator
    - Back/Next navigation
    - Persist draft state

### Business Rules
- Stake amount: $5 (500¢) to $1000 (100,000¢)
- Distribution: charityPercent + supportersPercent = 100
- Dates: startDate must be future, endDate must be after startDate
- Only FAILED, EXPIRED, ABANDONED can be restarted
- SUCCEEDED cannot be restarted
```

---

## Phase 3: Check-ins

```
## Phase 3: Check-ins

Implement daily check-in tracking with offline support.

### Backend API Endpoints
- POST /api/v1/check-ins - Submit check-in (idempotent per day)
  Request: { commitmentId, status, evidenceType, notes? }
  Response: CheckIn

- GET /api/v1/check-ins/:id - Get single check-in
  Response: CheckIn

- GET /api/v1/check-ins/commitment/:commitmentId - Get check-in history
  Response: CheckIn[]

### Files to Implement

1. src/api/endpoints/check-ins.api.ts
   - submit(request): Promise<CheckIn>
   - get(id): Promise<CheckIn>
   - getForCommitment(commitmentId): Promise<CheckIn[]>

2. src/features/check-ins/stores/pending-checkins.store.ts (Zustand + persist)
   - pendingCheckIns: PendingCheckIn[]
   - addPending(checkIn): string (returns local ID)
   - removePending(id): void
   - incrementRetryCount(id): void
   - getPendingForCommitment(commitmentId): PendingCheckIn[]

   For offline support - queue check-ins when offline

3. src/features/check-ins/hooks/useCheckIns.ts
   - TanStack Query for check-in history
   - Query key: ['check-ins', commitmentId]
   - Include pending check-ins from store

4. src/features/check-ins/hooks/useSubmitCheckIn.ts
   - TanStack Mutation with offline support
   - If offline: add to pending store
   - If online: submit to API
   - Optimistic update
   - Invalidate commitment query on success

5. src/features/check-ins/hooks/useCheckInHistory.ts
   - Combine API data with pending check-ins
   - Group by date
   - Calculate streaks

6. src/shared/hooks/useNetworkStatus.ts
   - Use @react-native-community/netinfo
   - isConnected state
   - Subscribe to changes

7. src/features/check-ins/hooks/useNetworkSync.ts
   - Watch for network reconnection
   - Sync pending check-ins on reconnect
   - Retry with exponential backoff
   - Max 3 retries per check-in

8. src/features/check-ins/components/CheckInButton.tsx
   - Large tappable button
   - States: Ready, Completed today, Pending sync
   - Haptic feedback on tap
   - Confirm dialog

9. src/features/check-ins/components/CheckInCalendar.tsx
   - Month view calendar
   - Color-coded days: green (completed), red (missed), gray (skipped), none (future)
   - Show current streak
   - Tap day to see details

10. src/features/check-ins/components/CheckInStreak.tsx
    - Display current streak prominently
    - Fire/flame animation for streaks > 7
    - Longest streak badge

11. app/(main)/commitments/[id]/check-in.tsx
    - Check-in submission screen
    - Status selector: COMPLETED or SKIPPED
    - Evidence type: SELF_REPORT, PHOTO, MANUAL
    - Optional notes (max 1000 chars)
    - Submit button
    - Success animation

### Business Rules
- One check-in per commitment per day (idempotent)
- Users can only submit COMPLETED or SKIPPED (MISSED is computed by evaluation)
- Check-ins only allowed on ACTIVE commitments
- Notes max length: 1000 characters
- Use commitment timezone for date boundaries

### Offline Behavior
- Show "Offline" indicator when disconnected
- Queue check-ins locally with timestamp
- Sync automatically when back online
- Show pending sync indicator on check-ins
- Dedup on server via idempotency (same commitmentId + date)
```

---

## Phase 4: Supporters

```
## Phase 4: Supporters

Implement supporter invitation, management, and voting.

### Backend API Endpoints
- POST /api/v1/commitments/:id/supporters - Invite supporter
  Request: { email?, userId?, phone?, role }
  Response: { id, commitmentId, supporterUserId, role, state, invitedAt }

- GET /api/v1/commitments/:id/supporters - List supporters
  Response: Supporter[]

- POST /api/v1/supporters/:id/accept - Accept invitation
  Response: Supporter

- POST /api/v1/supporters/:id/decline - Decline invitation
  Response: 204 No Content

- DELETE /api/v1/supporters/:id - Remove supporter
  Response: 204 No Content

- POST /api/v1/commitments/:id/failure-votes - Cast vote
  Request: { vote: "FAIL" | "ABSTAIN", reason? }
  Response: Vote

- GET /api/v1/commitments/:id/failure-votes/status - Get voting status
  Response: VotingStatus

- GET /api/v1/commitments/:id/failure-votes - Get all votes
  Response: Vote[]

### Files to Implement

1. src/api/endpoints/supporters.api.ts
   - invite(commitmentId, request): Promise<Supporter>
   - list(commitmentId): Promise<Supporter[]>
   - accept(supporterId): Promise<Supporter>
   - decline(supporterId): Promise<void>
   - remove(supporterId): Promise<void>
   - castVote(commitmentId, request): Promise<Vote>
   - getVotingStatus(commitmentId): Promise<VotingStatus>
   - getVotes(commitmentId): Promise<Vote[]>

2. src/features/supporters/hooks/useSupporters.ts
   - TanStack Query for supporter list
   - Query key: ['supporters', commitmentId]

3. src/features/supporters/hooks/useInviteSupporter.ts
   - TanStack Mutation
   - Email or phone validation
   - Invalidate supporter list on success

4. src/features/supporters/hooks/useRespondToInvite.ts
   - TanStack Mutation for accept/decline
   - Handle deep link from invitation

5. src/features/supporters/hooks/useCastVote.ts
   - TanStack Mutation
   - Only for VERIFIER role supporters
   - Optimistic update
   - Invalidate voting status on success

6. src/features/supporters/components/SupporterList.tsx
   - List of supporters with role badges
   - State indicators: INVITED, ACTIVE
   - Remove button for commitment owner
   - Accept/Decline for pending invites (when viewing as supporter)

7. src/features/supporters/components/InviteSupporterModal.tsx
   - Input: email or phone
   - Role selector: OBSERVER, ENCOURAGER, VERIFIER
   - Role descriptions:
     - OBSERVER: Can view progress
     - ENCOURAGER: Can send messages
     - VERIFIER: Can vote on failure
   - Send invitation button

8. src/features/supporters/components/VotingPanel.tsx
   - Show voting status
   - Progress bar: votesReceived / requiredVotes
   - Vote buttons: FAIL, ABSTAIN
   - Optional reason field (max 500 chars)
   - Only shown to VERIFIER supporters
   - Disabled if already voted

9. app/(main)/commitments/[id]/supporters.tsx
   - Supporter management screen
   - List current supporters
   - Invite new supporter button
   - Voting status section (if voting is active)
   - Cast vote section (if user is VERIFIER)

### Business Rules
- Supporter roles: OBSERVER < ENCOURAGER < VERIFIER
- Only VERIFIER can vote on failure
- Vote types: FAIL or ABSTAIN
- Reason is optional, max 500 chars
- Once voted, cannot change vote
- Threshold types: UNANIMOUS, MAJORITY, SUPERMAJORITY
- requiredVotes varies by threshold configuration
```

---

## Phase 5: Evaluations

```
## Phase 5: Evaluations

Implement progress metrics visualization and trend tracking.

### Data Structure (from backend evaluation service)
EvaluationMetrics:
- totalDays: number
- completedCount: number
- missedCount: number
- skippedCount: number
- completionRatio: number (0.0 - 1.0, 4 decimal places)
- streakCurrent: number
- streakLongest: number
- lastCheckInDate: string | null
- trend: "UP" | "DOWN" | "STABLE"

Trend threshold: 5% change from previous evaluation

### Files to Implement

1. src/features/evaluations/hooks/useEvaluation.ts
   - Derive evaluation data from check-in history
   - Calculate metrics client-side (mirrors backend logic)
   - Or fetch from commitment detail endpoint

2. src/features/evaluations/components/MetricsCard.tsx
   - Display key metrics:
     - Completion ratio as percentage
     - Completed / Total days
     - Current streak
     - Longest streak
   - Visual progress bars

3. src/features/evaluations/components/TrendIndicator.tsx
   - UP: Green arrow, "Improving"
   - DOWN: Red arrow, "Needs attention"
   - STABLE: Gray dash, "Steady"
   - Animated icon

4. src/features/evaluations/components/ProgressChart.tsx
   - Line chart showing completion ratio over time
   - Weekly data points
   - Trend line
   - Use react-native-chart-kit or victory-native

5. src/features/evaluations/components/StreakDisplay.tsx
   - Large streak number
   - Fire emoji/icon for streaks > 7
   - "Personal best" badge if current equals longest
   - Motivational message

6. app/(main)/commitments/[id]/progress.tsx
   - Full evaluation screen
   - Metrics cards at top
   - Trend indicator
   - Progress chart (weekly/monthly toggle)
   - Check-in calendar (month view)
   - Cycle history (for restarted commitments)

### Metric Calculations (Client-side)
```typescript
function calculateMetrics(checkIns: CheckIn[], startDate: Date, endDate: Date): EvaluationMetrics {
  const today = new Date();
  const evaluationDate = today < endDate ? today : endDate;
  const totalDays = differenceInDays(evaluationDate, startDate) + 1;

  const completedCount = checkIns.filter(c => c.status === 'COMPLETED').length;
  const skippedCount = checkIns.filter(c => c.status === 'SKIPPED').length;
  const missedCount = totalDays - completedCount - skippedCount;

  // Ratio excludes skipped
  const completionRatio = completedCount / (completedCount + missedCount);

  // Streak calculation
  const { current: streakCurrent, longest: streakLongest } = calculateStreaks(checkIns, startDate);

  return {
    totalDays,
    completedCount,
    missedCount,
    skippedCount,
    completionRatio,
    streakCurrent,
    streakLongest,
    lastCheckInDate: getLastCheckInDate(checkIns),
  };
}
```

### UI Design
- Use consistent color coding:
  - Green: Good progress (>80% completion)
  - Yellow: Moderate progress (50-80%)
  - Red: Low progress (<50%)
- Celebrate streaks with animations
- Non-judgmental language in all copy
```

---

## Phase 6: Notifications

```
## Phase 6: Notifications

Implement push notifications and in-app notification inbox.

### Backend API Endpoints
- GET /api/v1/notifications/inbox - Get notification inbox
  Query: unreadOnly?, limit?, cursor?
  Response: { items: NotificationInboxItem[], nextCursor?, unreadCount }

- PATCH /api/v1/notifications/:id/read - Mark as read
  Response: { id, isRead: true, readAt }

- PATCH /api/v1/notifications/mark-all-read - Mark all as read
  Response: { updatedCount }

### Notification Types
| Type | Title | Body | Action URL |
|------|-------|------|------------|
| COMMITMENT_ACTIVATED | "Your commitment is now active" | "Good luck with '{{commitmentName}}'!..." | /commitments/{{id}} |
| COMMITMENT_RESTARTED | "A new chapter begins" | "You've started fresh with '{{commitmentName}}'..." | /commitments/{{id}} |
| CHECKIN_MISSED | "A day without a check-in" | "Yesterday passed without recording progress..." | /commitments/{{id}}/check-in |
| EVALUATION_SUMMARY | "Your week in review" | "This week: {{completed}} check-ins..." | /commitments/{{id}}/progress |
| SUPPORTER_INVITED | "You've been invited to support someone" | "{{inviterName}} has asked you..." | /supporters/invitations/{{id}} |
| VOTE_RECEIVED | "A supporter shared their perspective" | "One of your supporters has voted..." | /commitments/{{id}}/supporters |
| FAILURE_THRESHOLD | "Your commitment needs attention" | "Your supporters have raised concerns..." | /commitments/{{id}} |

### Files to Implement

1. src/api/endpoints/notifications.api.ts
   - getInbox(params): Promise<NotificationInboxResponse>
   - markAsRead(id): Promise<{ id, isRead, readAt }>
   - markAllAsRead(): Promise<{ updatedCount }>

2. src/features/notifications/services/push-notification.service.ts
   - registerForPushNotifications(): Promise<string> (returns push token)
   - Send token to backend: POST /users/me/push-token
   - Configure notification handler
   - Handle foreground notifications
   - Handle notification tap (open deep link)

3. src/features/notifications/services/local-notification.service.ts
   - Schedule local reminders
   - scheduleDailyReminder(commitmentId, time): Promise<string>
   - cancelReminder(id): Promise<void>
   - For check-in reminders

4. src/features/notifications/hooks/useNotifications.ts
   - TanStack Query for inbox
   - Query key: ['notifications', 'inbox']
   - Infinite query for pagination

5. src/features/notifications/hooks/usePushNotifications.ts
   - Register on app launch
   - Listen for notification events
   - Handle deep linking

6. src/features/notifications/hooks/useNotificationInbox.ts
   - Mark as read mutation
   - Mark all as read mutation
   - Optimistic updates

7. src/features/notifications/components/NotificationBadge.tsx
   - Red badge with unread count
   - Animate on new notification
   - Used in tab bar icon

8. src/features/notifications/components/NotificationItem.tsx
   - Icon based on type
   - Title and body text
   - Timestamp (relative: "2h ago")
   - Unread indicator (blue dot)
   - Tap to mark as read + navigate

9. src/providers/NotificationProvider.tsx
   - Wrap app with notification context
   - Handle background notification registration
   - Listen for notification events
   - Update badge count

10. app/(main)/notifications.tsx
    - Notification inbox screen
    - List of notifications (newest first)
    - Pull to refresh
    - Mark all as read button
    - Empty state
    - Infinite scroll pagination

11. src/navigation/linking.ts (update)
    - Handle deep links from notifications:
      - anchor://commitments/:id
      - anchor://commitments/:id/check-in
      - anchor://commitments/:id/supporters
      - anchor://commitments/:id/progress
      - anchor://supporters/invitations/:id
      - anchor://notifications

### Push Notification Setup
1. Configure expo-notifications in app.json
2. Request permissions on first launch
3. Get ExpoPushToken
4. Send token to backend
5. Handle foreground: show in-app banner
6. Handle background: show system notification
7. Handle tap: navigate to actionUrl

### Copy Guidelines
All notification copy is **non-punitive** and **supportive**:
- "A day without a check-in" NOT "You missed a check-in"
- "Would you like to reflect?" NOT "You need to check in"
- "Your commitment needs attention" NOT "Your commitment is failing"
```

---

## Phase 7: Polish & Production

```
## Phase 7: Polish & Production Readiness

Final polish, error handling, and production preparation.

### Files to Implement

1. src/shared/components/feedback/ErrorBoundary.tsx
   - Catch React errors
   - Show friendly error screen
   - "Try Again" button
   - Report error to analytics

2. src/shared/components/feedback/EmptyState.tsx
   - Reusable empty state component
   - Icon, title, description, action button
   - Used for: No commitments, No notifications, etc.

3. src/shared/components/ui/Toast.tsx
   - Toast notification system
   - Types: success, error, warning, info
   - Auto-dismiss after 3s
   - Swipe to dismiss

4. src/shared/components/layout/SafeScreen.tsx
   - SafeAreaView wrapper
   - Consistent padding
   - Status bar handling

5. src/shared/hooks/useAppState.ts
   - Track app state: active, background, inactive
   - Refetch data when app becomes active
   - Clean up when backgrounded

6. Update all screens with:
   - Loading skeletons (not spinners)
   - Pull to refresh
   - Error states with retry
   - Empty states
   - Haptic feedback on actions

7. eas.json
   - Development profile (internal distribution)
   - Preview profile (TestFlight/Internal Testing)
   - Production profile

8. Update app.json for production:
   - App icons (all sizes)
   - Splash screen
   - Version number
   - Bundle IDs

### Accessibility
- All images have alt text
- All buttons have accessible labels
- Sufficient color contrast
- Support for screen readers
- Reduce motion option

### Performance
- Use React.memo for list items
- Lazy load screens
- Image optimization
- Bundle size monitoring

### Security Checklist
- Tokens in secure store (not AsyncStorage)
- No sensitive data in logs
- HTTPS only
- Certificate pinning (optional)
- Biometric gate for sensitive actions
- Session timeout after inactivity

### Testing
- Unit tests for hooks and utils
- Integration tests for API calls
- E2E tests with Detox (optional)
- Manual QA checklist
```

---

# Type Definitions Reference

```typescript
// ============================================================================
// AUTHENTICATION TYPES
// ============================================================================

export type Role = 'USER' | 'SUPPORTER' | 'ADMIN';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  phone?: string;
}

export interface AuthenticatedUser {
  userId: string;
  email: string;
  roles: Role[];
}

// ============================================================================
// COMMITMENT TYPES
// ============================================================================

export enum CommitmentState {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  BROKEN = 'BROKEN',
  CANCELLED = 'CANCELLED',
}

export enum TemplateType {
  QUIT_SMOKING = 'QUIT_SMOKING',
  EXERCISE = 'EXERCISE',
  MEDITATION = 'MEDITATION',
  DIET = 'DIET',
  SLEEP = 'SLEEP',
  CUSTOM = 'CUSTOM',
}

export enum CycleStatus {
  ACTIVE = 'ACTIVE',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED',
  ABANDONED = 'ABANDONED',
}

export enum RecoveryMode {
  FULL_RESET = 'FULL_RESET',
  RETRY_WITH_SAME_RULES = 'RETRY_WITH_SAME_RULES',
  ADJUSTED_RETRY = 'ADJUSTED_RETRY',
}

export interface DistributionConfig {
  charityPercent: number;
  supportersPercent: number;
  charityId?: string;
}

export interface Commitment {
  id: string;
  userId: string;
  templateType: TemplateType;
  state: CommitmentState;
  timezone: string;
  stakeAmountCents?: number;
  stakeCurrency?: string;
  stakeState?: string;
  startDate: string;
  endDate: string;
  activatedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommitmentRequest {
  templateType: TemplateType;
  timezone: string;
  stakeAmountCents: number;
  stakeCurrency?: string;
  distributionConfig?: DistributionConfig;
  startDate: string;
  endDate: string;
}

export interface RestartCommitmentRequest {
  recoveryMode: RecoveryMode;
  newStartDate: string;
  newEndDate: string;
  newStakeAmountCents?: number;
  newDistributionConfig?: DistributionConfig;
  reinviteSupporterIds?: string[];
}

export interface RestartEligibility {
  canRestart: boolean;
  reason?: string;
  lastCycleStatus?: CycleStatus;
  totalCycles: number;
}

export interface CycleHistoryItem {
  id: string;
  sequenceNumber: number;
  status: CycleStatus;
  recoveryMode?: RecoveryMode;
  startDate: string;
  endDate: string;
  startedAt: string;
  endedAt?: string;
  endReason?: string;
}

// ============================================================================
// CHECK-IN TYPES
// ============================================================================

export enum CheckInStatus {
  COMPLETED = 'COMPLETED',
  SKIPPED = 'SKIPPED',
  MISSED = 'MISSED',
}

export enum EvidenceType {
  SELF_REPORT = 'SELF_REPORT',
  PHOTO = 'PHOTO',
  MANUAL = 'MANUAL',
}

export interface CheckIn {
  id: string;
  commitmentId: string;
  cycleId: string;
  userId: string;
  checkInDate: string;
  status: CheckInStatus;
  evidenceType: EvidenceType;
  notes: string | null;
  createdAt: string;
  wasCached: boolean;
}

export interface SubmitCheckInRequest {
  commitmentId: string;
  status: CheckInStatus;
  evidenceType: EvidenceType;
  notes?: string;
}

// ============================================================================
// SUPPORTER TYPES
// ============================================================================

export enum SupporterRole {
  OBSERVER = 'OBSERVER',
  ENCOURAGER = 'ENCOURAGER',
  VERIFIER = 'VERIFIER',
}

export enum SupporterRelationshipState {
  INVITED = 'INVITED',
  ACTIVE = 'ACTIVE',
  DECLINED = 'DECLINED',
  REMOVED = 'REMOVED',
}

export enum VoteType {
  FAIL = 'FAIL',
  ABSTAIN = 'ABSTAIN',
}

export interface Supporter {
  id: string;
  commitmentId: string;
  supporterUserId: string;
  displayName?: string | null;
  role: SupporterRole;
  state: SupporterRelationshipState;
  invitedAt: string;
  acceptedAt: string | null;
}

export interface InviteSupporterRequest {
  email?: string;
  userId?: string;
  phone?: string;
  role: SupporterRole;
}

export interface CastVoteRequest {
  vote: VoteType;
  reason?: string;
}

export interface Vote {
  id: string;
  commitmentId: string;
  supporterUserId: string;
  vote: VoteType;
  reason?: string;
  votedAt: string;
}

export interface VotingStatus {
  commitmentId: string;
  authorityType: string;
  totalSupporters: number;
  votesReceived: number;
  failVotes: number;
  abstainVotes: number;
  requiredVotes: number;
  thresholdReached: boolean;
}

// ============================================================================
// EVALUATION TYPES
// ============================================================================

export enum EvaluationTrend {
  UP = 'UP',
  DOWN = 'DOWN',
  STABLE = 'STABLE',
}

export interface EvaluationMetrics {
  totalDays: number;
  completedCount: number;
  missedCount: number;
  skippedCount: number;
  completionRatio: number;
  streakCurrent: number;
  streakLongest: number;
  lastCheckInDate: string | null;
  trend?: EvaluationTrend;
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export enum NotificationType {
  COMMITMENT_ACTIVATED = 'COMMITMENT_ACTIVATED',
  COMMITMENT_RESTARTED = 'COMMITMENT_RESTARTED',
  CHECKIN_MISSED = 'CHECKIN_MISSED',
  EVALUATION_SUMMARY = 'EVALUATION_SUMMARY',
  SUPPORTER_INVITED = 'SUPPORTER_INVITED',
  VOTE_RECEIVED = 'VOTE_RECEIVED',
  FAILURE_THRESHOLD = 'FAILURE_THRESHOLD',
}

export interface NotificationInboxItem {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  actionUrl: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationInboxResponse {
  items: NotificationInboxItem[];
  nextCursor?: string;
  unreadCount: number;
}
```

---

# Type Sharing: OpenAPI Code Generation

Instead of manually maintaining duplicate type definitions, generate types automatically from the backend's OpenAPI specification.

## Setup Instructions

### 1. Install the Generator

```bash
npm install -D openapi-typescript
```

### 2. Add Scripts to package.json

```json
{
  "scripts": {
    "generate:types": "openapi-typescript http://localhost:3000/api-json -o ./src/api/types/generated.ts",
    "generate:types:file": "openapi-typescript ./openapi.json -o ./src/api/types/generated.ts"
  }
}
```

### 3. Generate Types

**Option A: From Running Backend (Development)**
```bash
# Start the backend first
cd ../anchor && npm run start

# In the mobile project, generate types
npm run generate:types
```

**Option B: From Exported Spec File (CI/CD)**
```bash
# Export the spec from backend (run once when API changes)
curl http://localhost:3000/api-json > openapi.json

# Generate from file (no running backend needed)
npm run generate:types:file
```

### 4. Usage in Code

```typescript
// Import generated types
import type { paths, components } from '@/api/types/generated';

// Use component schemas
type Commitment = components['schemas']['CommitmentResponseDto'];
type CreateCommitmentRequest = components['schemas']['CreateCommitmentDto'];

// Use path types for requests/responses
type GetCommitmentsResponse = paths['/api/v1/commitments']['get']['responses']['200']['content']['application/json'];
```

### 5. Recommended Workflow

1. **During Development**: Run `npm run generate:types` after backend API changes
2. **In CI/CD**: Commit `openapi.json` to the repo and use `generate:types:file`
3. **Pre-commit Hook** (optional): Add type generation to ensure types are always fresh

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run generate:types:file && git add src/api/types/generated.ts"
    }
  }
}
```

### Benefits

- **Single Source of Truth**: Types are generated from the actual API specification
- **Always in Sync**: Regenerate whenever the backend changes
- **Request/Response Types**: Includes DTOs, query params, and response shapes
- **IDE Autocompletion**: Full TypeScript support with generated types
- **Catch Breaking Changes**: TypeScript will flag incompatibilities at compile time

---

# Backend Source Reference

The authoritative type definitions are in these backend files:
- `src/infrastructure/auth/types/auth.types.ts`
- `src/domain/commitment/types/commitment.types.ts`
- `src/domain/checkin/types/checkin.types.ts`
- `src/domain/supporter/types/supporter.types.ts`
- `src/domain/evaluation/types/evaluation.types.ts`
- `src/domain/notification/types/notification.types.ts`
