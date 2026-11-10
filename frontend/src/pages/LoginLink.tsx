import React, { useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '../components/Button';
import LoadingContent from '../components/LoadingContent';
import ExpiredLink from '../components/ExpiredLink';
import OpenAppBox from '../components/OpenAppBox';
import AuthShell, { AuthNotice } from '../components/AuthShell';
import {
  ArrowRightOnRectangleIcon,
  DevicePhoneMobileIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import { useLoginWithLinkMutation, useTokenInfoQuery } from '../services/auth/auth.service';
import { getAuthErrorCode } from '../common/utils/auth-error';
import { AUTH_ERRORS } from '../common/errors/entities/auth.errors';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { isMobileRealmResult } from '../common/interfaces/auth.interface';

// /login/link?token= (VIC 2.0, #514): the magic link from the login page, a Team invite and the cutover
// "transition" email all land here. The token is used only when the person presses the button, never on
// page load: email scanners open links before the person does, and the link is single use.
const LoginLink = () => {
  const { t } = useTranslation('login_link');
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { startSession } = useAuth();
  const [expired, setExpired] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [appEmail, setAppEmail] = useState<string | null>(null);

  const { data: info, isLoading, isError } = useTokenInfoQuery(token);
  const loginWithLink = useLoginWithLinkMutation();

  if (!token || isError || expired) {
    return (
      <AuthShell
        title={t('expired_title')}
        icon={<ExclamationTriangleIcon className="w-6 h-6" aria-hidden="true" />}
      >
        <ExpiredLink token={token} />
      </AuthShell>
    );
  }

  if (isLoading || !info) {
    return (
      <AuthShell title={t('title.login')}>
        <LoadingContent />
      </AuthShell>
    );
  }

  // An email confirmation link opened on the wrong page.
  if (info.purpose === 'verify_email') {
    return <Navigate to={`/confirm-email?token=${encodeURIComponent(token)}`} replace />;
  }

  // A volunteer belongs in the app, which logs in with an emailed code.
  if (appEmail || info.realm === 'mobile') {
    return (
      <AuthShell
        title={t('volunteer.title')}
        icon={<DevicePhoneMobileIcon className="w-6 h-6" aria-hidden="true" />}
      >
        <OpenAppBox
          title={t('volunteer.open_app')}
          description={t('volunteer.description')}
          email={appEmail ?? undefined}
        />
      </AuthShell>
    );
  }

  const onContinue = () => {
    setError(null);
    loginWithLink.mutate(token, {
      onSuccess: async (result) => {
        if (isMobileRealmResult(result)) {
          setAppEmail(result.email);
          return;
        }
        await startSession(result);
        navigate('/', { replace: true });
      },
      onError: (err) => {
        const code = getAuthErrorCode(err);
        if (code === AUTH_ERRORS.AUTH_005) {
          setExpired(true);
          return;
        }
        setError(code ? InternalErrors.AUTH_ERRORS.getError(code) : t('errors.generic'));
      },
    });
  };

  return (
    <AuthShell
      title={t(`title.${info.purpose}`, { organization: info.organizationName ?? '' })}
      subtitle={t(`description.${info.purpose}`, { email: info.maskedEmail })}
      icon={<ArrowRightOnRectangleIcon className="w-6 h-6" aria-hidden="true" />}
    >
      {error && <AuthNotice tone="error">{error}</AuthNotice>}
      <Button
        type="button"
        label={t('submit')}
        disabled={loginWithLink.isLoading}
        className="btn-primary w-full"
        onClick={onContinue}
      />
      <p className="text-xs text-cool-gray-500 text-center">{t('single_use')}</p>
    </AuthShell>
  );
};

export default LoginLink;
