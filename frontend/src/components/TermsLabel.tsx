import React from 'react';
import { useTranslation } from 'react-i18next';

// "I agree with the terms and conditions and the privacy policy", with the links from the env.
// Shared by both organization registrations (/register and the one from NGO Hub).
const TermsLabel = () => {
  const { t } = useTranslation('register_organization');
  const termsUrl = import.meta.env.VITE_TERMS_URL;
  const privacyUrl = import.meta.env.VITE_PRIVACY_URL;

  return (
    <>
      {t('form.terms.label')}{' '}
      {termsUrl && (
        <a className="text-sm text-navy underline" href={termsUrl} target="_blank" rel="noreferrer">
          {t('form.terms.terms')}
        </a>
      )}
      {termsUrl && privacyUrl && ` ${t('form.terms.and')} `}
      {privacyUrl && (
        <a
          className="text-sm text-navy underline"
          href={privacyUrl}
          target="_blank"
          rel="noreferrer"
        >
          {t('form.terms.privacy')}
        </a>
      )}
    </>
  );
};

export default TermsLabel;
