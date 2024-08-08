import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ro from '../../assets/locales/ro/translation.json';
import en from '../../assets/locales/en/translation.json';

i18n.use(initReactI18next).init({
  lng: 'ro',
  fallbackLng: 'en',
  resources: {
    ro,
    en,
  },
  debug: false,
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
