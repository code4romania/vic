import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LoadingContent from '../components/LoadingContent';
import ExpiredLink from '../components/ExpiredLink';
import OpenAppBox from '../components/OpenAppBox';
import AuthShell from '../components/AuthShell';
import { CheckBadgeIcon, EnvelopeIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import { confirmEmail } from '../services/auth/auth.api';
import { isMobileRealmResult } from '../common/interfaces/auth.interface';

type ConfirmState = { kind: 'loading' } | { kind: 'failed' } | { kind: 'mobile'; email: string };

// /confirm-email?token=: called once on load. NGO registration → session → dashboard with the
// validation banner; a volunteer's sign-up → open the app with the email filled (R17).
const ConfirmEmail = () => {
  const { t } = useTranslation('confirm_email');
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { startSession } = useAuth();
  const [state, setState] = useState<ConfirmState>({ kind: token ? 'loading' : 'failed' });
  // The link is single use: StrictMode runs effects twice in development, so call it only once.
  const called = useRef<boolean>(false);

  useEffect(() => {
    if (!token || called.current) return;
    called.current = true;

    confirmEmail(token)
      .then(async (result) => {
        if (isMobileRealmResult(result)) {
          setState({ kind: 'mobile', email: result.email });
          return;
        }
        await startSession(result);
        navigate('/', { replace: true });
      })
      .catch(() => setState({ kind: 'failed' }));
  }, [token, startSession, navigate]);

  if (state.kind === 'mobile') {
    return (
      <AuthShell
        title={t('done.title')}
        icon={<CheckBadgeIcon className="w-6 h-6" aria-hidden="true" />}
      >
        <OpenAppBox title={t('done.open_app')} email={state.email} />
      </AuthShell>
    );
  }

  if (state.kind === 'failed') {
    return (
      <AuthShell
        title={t('failed_title')}
        icon={<ExclamationTriangleIcon className="w-6 h-6" aria-hidden="true" />}
      >
        <ExpiredLink token={token} />
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title={t('title')}
      subtitle={t('wait')}
      icon={<EnvelopeIcon className="w-6 h-6" aria-hidden="true" />}
    >
      <LoadingContent />
    </AuthShell>
  );
};

export default ConfirmEmail;
