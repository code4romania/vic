import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Button from './Button';
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
      <div role="status" className="rounded-lg bg-green-50 border border-green-300 p-4 text-sm">
        {t('expired_link.sent')}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div role="alert" className="rounded-lg bg-red-50 border border-red-300 p-4 text-sm">
        {t('expired_link.description')}
      </div>
      {token ? (
        <Button
          type="button"
          label={t('expired_link.resend')}
          className="btn-primary"
          onClick={onResend}
          disabled={resendToken.isLoading}
        />
      ) : (
        <Link to="/login" className="text-sm underline text-center">
          {t('expired_link.new_login')}
        </Link>
      )}
    </div>
  );
};

export default ExpiredLink;
