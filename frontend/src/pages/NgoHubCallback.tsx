import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import AuthShell, { AuthNotice } from '../components/AuthShell';
import LoadingContent from '../components/LoadingContent';
import NgoHubLoginButton from '../components/NgoHubLoginButton';
import { useAuth } from '../hooks/useAuth';
import { useNgoHubCallbackMutation } from '../services/auth/auth.service';
import { isNgoHubRegistration } from '../common/interfaces/auth.interface';
import { getAuthErrorCode } from '../common/utils/auth-error';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { AUTH_ERRORS } from '../common/errors/entities/auth.errors';

interface CallbackParams {
  code: string | null;
  state: string | null;
  iss: string | null;
  error: string | null;
}

// Keeps this page's URL (it carried the code) out of the Referer of anything it loads or links to.
const useNoReferrer = () => {
  useLayoutEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'referrer';
    meta.content = 'no-referrer';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);
};

// /login/ngohub/callback: NGO Hub sends the browser back here. The code and state leave the URL before
// anything is shown (history, screenshots, Referer), then go to the API once. The answer is a session, or
// a registration for an NGO VIC does not know yet (the prefilled form, /register/ngohub).
const NgoHubCallback = () => {
  const { t } = useTranslation('ngohub');
  const location = useLocation();
  const navigate = useNavigate();
  const { startSession } = useAuth();
  const callback = useNgoHubCallbackMutation();
  const sent = useRef(false);
  const [failure, setFailure] = useState<string | null>(null);
  useNoReferrer();

  // Read once, on the first render: the URL is cleaned right after.
  const [params] = useState<CallbackParams>(() => {
    const search = new URLSearchParams(location.search);
    return {
      code: search.get('code'),
      state: search.get('state'),
      iss: search.get('iss'),
      error: search.get('error'),
    };
  });

  // Out of the browser's address bar and history before the first paint, then out of the router too.
  useLayoutEffect(() => {
    if (window.location.search.includes('code=')) {
      window.history.replaceState(window.history.state, '', window.location.pathname);
    }
  }, []);
  useEffect(() => {
    if (location.search) navigate(location.pathname, { replace: true });
  }, []);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    if (params.error === 'access_denied') {
      setFailure(t('callback.cancelled'));
      return;
    }
    if (!params.code || !params.state) {
      setFailure(InternalErrors.AUTH_ERRORS.getError(AUTH_ERRORS.AUTH_019));
      return;
    }
    callback.mutate(
      { code: params.code, state: params.state, ...(params.iss ? { iss: params.iss } : {}) },
      {
        onSuccess: async (result) => {
          if (isNgoHubRegistration(result)) {
            navigate('/register/ngohub', { replace: true, state: result.registration });
            return;
          }
          await startSession(result);
          navigate('/', { replace: true });
        },
        onError: (error) => {
          const code = getAuthErrorCode(error);
          setFailure(
            code
              ? InternalErrors.AUTH_ERRORS.getError(code)
              : InternalErrors.AUTH_ERRORS.getError(AUTH_ERRORS.AUTH_019),
          );
        },
      },
    );
  }, []);

  if (!failure) {
    return (
      <AuthShell title={t('callback.title')} subtitle={t('callback.loading')}>
        <LoadingContent />
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title={t('callback.failed_title')}
      icon={<ExclamationTriangleIcon className="w-6 h-6" aria-hidden="true" />}
    >
      <AuthNotice tone="error">{failure}</AuthNotice>
      <div className="flex flex-col gap-3">
        <NgoHubLoginButton label={t('callback.retry')} />
        <Link to="/login" className="btn-text-primary w-full text-center">
          {t('callback.back_to_login')}
        </Link>
      </div>
    </AuthShell>
  );
};

export default NgoHubCallback;
