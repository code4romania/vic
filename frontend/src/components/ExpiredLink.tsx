import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Button from './Button';
import { AuthNotice } from './AuthShell';
import { useResendTokenMutation } from '../services/auth/auth.service';

// A used, expired or unknown link: explain, offer a new one. The resend always answers 200 (R14),
// so the page always ends in "check your email".
const ExpiredLink = ({ token }: { token: string | null }) => {
  const { t } = useTranslation('auth');
  const [sent, setSent] = useState<boolean>(false);
  const resendToken = useResendTokenMutation();

  const onResend = () => {
    if (!token) return;
    resendToken.mutate(token, { onSettled: () => setSent(true) });
  };

  if (sent) {
    return (
      <div className="flex flex-col gap-4">
        <AuthNotice tone="success">{t('expired_link.sent')}</AuthNotice>
        <Link to="/login" className="btn-outline-secondary w-full">
          {t('expired_link.back_to_login')}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <AuthNotice tone="error">{t('expired_link.description')}</AuthNotice>
      <p className="text-sm text-cool-gray-600">{t('expired_link.why')}</p>
      {token ? (
        <Button
          type="button"
          label={t('expired_link.resend')}
          className="btn-primary w-full"
          onClick={onResend}
          disabled={resendToken.isLoading}
        />
      ) : (
        <Link to="/login" className="btn-primary w-full">
          {t('expired_link.new_login')}
        </Link>
      )}
    </div>
  );
};

export default ExpiredLink;
