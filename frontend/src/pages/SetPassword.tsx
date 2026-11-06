import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import LoadingContent from '../components/LoadingContent';
import ExpiredLink from '../components/ExpiredLink';
import OpenAppBox from '../components/OpenAppBox';
import AuthLayout from '../layouts/AuthLayout';
import { useAuth } from '../hooks/useAuth';
import { useSetPasswordMutation, useTokenInfoQuery } from '../services/auth/auth.service';
import { PASSWORD_REGEX } from '../common/constants/patterns';
import { getAuthErrorCode } from '../common/utils/auth-error';
import { AUTH_ERRORS } from '../common/errors/entities/auth.errors';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { isMobileRealmResult } from '../common/interfaces/auth.interface';

type SetPasswordForm = { password: string; confirmPassword: string };

// /set-password?token= for the transition email, a Team invite and Forgot password.
// The wording follows the token's purpose (R16). Web realm → session; mobile realm → open the app (R17).
const SetPassword = () => {
  const { t } = useTranslation('set_password');
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { startSession } = useAuth();
  const [expired, setExpired] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [appEmail, setAppEmail] = useState<string | null>(null);

  const { data: info, isLoading, isError } = useTokenInfoQuery(token);
  const setPassword = useSetPasswordMutation();

  const schema = yup.object({
    password: yup
      .string()
      .required(t('form.password.required'))
      .matches(PASSWORD_REGEX, t('form.password.rule')),
    confirmPassword: yup
      .string()
      .required(t('form.confirm.required'))
      .oneOf([yup.ref('password')], t('form.confirm.mismatch')),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SetPasswordForm>({
    defaultValues: { password: '', confirmPassword: '' },
    resolver: yupResolver(schema),
  });

  if (!token || isError || expired) {
    return (
      <AuthLayout title={t('expired_title')}>
        <ExpiredLink token={token} />
      </AuthLayout>
    );
  }

  if (isLoading || !info) {
    return (
      <AuthLayout title={t('title.reset')}>
        <LoadingContent />
      </AuthLayout>
    );
  }

  // An email confirmation link opened on the wrong page.
  if (info.purpose === 'verify_email') {
    return <Navigate to={`/confirm-email?token=${encodeURIComponent(token)}`} replace />;
  }

  if (appEmail) {
    return (
      <AuthLayout title={t('done.title')}>
        <OpenAppBox title={t('done.open_app')} email={appEmail} />
      </AuthLayout>
    );
  }

  const onSubmit = ({ password }: SetPasswordForm) => {
    setError(null);
    setPassword.mutate(
      { token, password },
      {
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
      },
    );
  };

  const isVolunteerTransition = info.purpose === 'transition' && info.realm === 'mobile';

  return (
    <AuthLayout title={t(`title.${info.purpose}`, { organization: info.organizationName ?? '' })}>
      <div className="text-sm text-cool-gray-500 flex flex-col gap-2">
        <p>{t(`description.${info.purpose}`, { email: info.maskedEmail })}</p>
        {isVolunteerTransition && <p>{t('description.volunteer_social')}</p>}
      </div>
      {error && (
        <div role="alert" className="rounded-lg bg-red-50 border border-red-300 p-4 text-sm">
          {error}
        </div>
      )}
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Controller
          name="password"
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <FormInput
              type="password"
              autoComplete="new-password"
              label={t('form.password.label')}
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              errorMessage={errors.password?.message}
              helper={<p>{t('form.password.rule')}</p>}
            />
          )}
        />
        <Controller
          name="confirmPassword"
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <FormInput
              type="password"
              autoComplete="new-password"
              label={t('form.confirm.label')}
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              errorMessage={errors.confirmPassword?.message}
            />
          )}
        />
        <Button
          type="submit"
          label={t('submit')}
          disabled={setPassword.isLoading}
          className="btn-primary"
        />
      </form>
    </AuthLayout>
  );
};

export default SetPassword;
