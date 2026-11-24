import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Language } from '../common/config/language';
import { chooseLanguage, currentLanguage } from '../services/auth/language.service';
import { useAuth } from './useAuth';

// The language on screen and the switcher's action. useTranslation re-renders the caller when the
// language changes.
export const useLanguage = () => {
  useTranslation();
  const { isAuthenticated } = useAuth();

  const setLanguage = useCallback(
    (language: Language) => chooseLanguage(language, isAuthenticated),
    [isAuthenticated],
  );

  return { language: currentLanguage(), setLanguage };
};
