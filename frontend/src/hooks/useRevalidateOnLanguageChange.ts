import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FieldErrors, FieldValues, Path, UseFormTrigger } from 'react-hook-form';

// A validation message is written when the field is checked, so the ones already on screen would stay
// in the old language after a switch. Checks those fields again; untouched fields stay quiet. For
// the pages that are not redrawn on a switch (login, registration).
export const useRevalidateOnLanguageChange = <T extends FieldValues>(
  trigger: UseFormTrigger<T>,
  errors: FieldErrors<T>,
): void => {
  const { i18n } = useTranslation();
  const language = i18n.resolvedLanguage;

  useEffect(() => {
    const fields = Object.keys(errors) as Path<T>[];
    if (fields.length) trigger(fields);
    // only a language change runs this, not every new error
  }, [language]);
};
