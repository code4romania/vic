import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { setLocale } from 'yup';
import ro from '../../assets/locales/ro/translation.json';
import en from '../../assets/locales/en/translation.json';
import { DEFAULT_LANGUAGE, LANGUAGES, initialLanguage } from './language';

i18n.use(initReactI18next).init({
  lng: initialLanguage(),
  supportedLngs: LANGUAGES,
  // a key missing in one file shows the other language instead of the raw key
  fallbackLng: { ro: ['en'], en: ['ro'], default: [DEFAULT_LANGUAGE] },
  resources: {
    ro,
    en,
  },
  debug: false,
  interpolation: {
    escapeValue: false,
  },
});

// Screen readers and the browser's own features (hyphenation, translate prompt) read <html lang>.
const syncDocumentLanguage = (language: string) => {
  document.documentElement.lang = language;
};
syncDocumentLanguage(i18n.language);
i18n.on('languageChanged', syncDocumentLanguage);

// Validators written without their own message (yup.string().required()) would answer with yup's
// English defaults. Functions, so the message is in the language of the moment it is shown.
setLocale({
  mixed: {
    required: () => i18n.t('general:required'),
    notType: () => i18n.t('general:validation.invalid'),
    oneOf: () => i18n.t('general:validation.invalid'),
  },
  string: {
    min: ({ min }) => i18n.t('general:validation.min', { value: min }),
    max: ({ max }) => i18n.t('general:validation.max', { value: max }),
  },
});

export default i18n;
