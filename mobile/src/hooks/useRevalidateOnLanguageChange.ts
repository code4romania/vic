import { useEffect, useRef } from 'react';
import { FieldErrors, FieldValues, UseFormTrigger } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

/**
 * The messages of a yup schema are written when a field is validated. After a change of language
 * the errors already on screen are validated again, so they are shown in the new language.
 */
export const useRevalidateOnLanguageChange = <T extends FieldValues>(
  trigger: UseFormTrigger<T>,
  errors: FieldErrors<T>,
): void => {
  const { i18n } = useTranslation();
  const errorsRef = useRef(errors);
  errorsRef.current = errors;
  const language = useRef(i18n.language);

  useEffect(() => {
    if (language.current === i18n.language) {
      return;
    }
    language.current = i18n.language;
    const names = Object.keys(errorsRef.current);
    if (names.length) {
      trigger(names as any);
    }
  }, [i18n.language, trigger]);
};
