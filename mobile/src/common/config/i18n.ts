import i18n, { ResourceLanguage } from 'i18next';
import { initReactI18next } from 'react-i18next';
import ro from '../../assets/locales/ro/translation.json';
import en from '../../assets/locales/en/translation.json';
import { bindDesignLabels } from './design-labels';

// Starts in Romanian; `resolveInitialLanguage` (./language) picks the real language while the
// splash screen is still up: the saved choice, else the phone's language.
i18n.use(initReactI18next).init<ResourceLanguage>({
  lng: 'ro',
  fallbackLng: 'en',
  compatibilityJSON: 'v3',
  resources: {
    en: en,
    ro: ro,
  },
  debug: false,
  interpolation: {
    escapeValue: false,
  },
});

bindDesignLabels(i18n);

export default i18n;
