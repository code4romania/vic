import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircleIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline';
import AuthShell, { AuthNotice } from '../components/AuthShell';
import Button from '../components/Button';
import { useNgoHubNotUsMutation } from '../services/auth/auth.service';
import { getAuthErrorCode } from '../common/utils/auth-error';
import { AUTH_ERRORS } from '../common/errors/entities/auth.errors';
import { InternalErrors } from '../common/errors/internal-errors.class';

// /login/ngohub/not-us?token=: the link the other admins get when an NGO Hub admin joined by CUI. Like
// the login links, the token is used only when the person presses the button (email scanners open links).
const NgoHubNotUs = () => {
  const { t } = useTranslation('ngohub');
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const notUs = useNgoHubNotUsMutation();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(token ? null : t('not_us.expired'));

  const onConfirm = () => {
    if (!token) return;
    setError(null);
    notUs.mutate(token, {
      onSuccess: () => setDone(true),
      onError: (err) => {
        const code = getAuthErrorCode(err);
        setError(
          code === AUTH_ERRORS.AUTH_005 || !code
            ? t('not_us.expired')
            : InternalErrors.AUTH_ERRORS.getError(code),
        );
      },
    });
  };

  if (done) {
    return (
      <AuthShell
        title={t('not_us.done_title')}
        icon={<CheckCircleIcon className="w-6 h-6" aria-hidden="true" />}
      >
        <AuthNotice tone="success">{t('not_us.done')}</AuthNotice>
        <Link to="/login" className="btn-outline-secondary w-full text-center">
          {t('not_us.back_to_login')}
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title={t('not_us.title')}
      subtitle={t('not_us.description')}
      icon={<ShieldExclamationIcon className="w-6 h-6" aria-hidden="true" />}
    >
      {error && <AuthNotice tone="error">{error}</AuthNotice>}
      {token && (
        <Button
          type="button"
          label={t('not_us.confirm')}
          className="btn-primary w-full"
          onClick={onConfirm}
          disabled={notUs.isLoading}
        />
      )}
      <Link to="/login" className="btn-text-primary w-full text-center">
        {t('not_us.back_to_login')}
      </Link>
    </AuthShell>
  );
};

export default NgoHubNotUs;
