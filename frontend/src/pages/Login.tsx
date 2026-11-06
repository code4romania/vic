import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import { useAuth } from '../hooks/useAuth';
import { AUTH_ERRORS } from '../common/errors/entities/auth.errors';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { useResendVerificationMutation } from '../services/auth/auth.service';
import { getAuthErrorCode } from '../common/utils/auth-error';
import AuthLayout from '../layouts/AuthLayout';
import OpenAppBox from '../components/OpenAppBox';

type LoginForm = { email: string; password: string };

// Shown until VITE_MIGRATION_NOTICE_UNTIL (YYYY-MM-DD) to people who had an account before the switch.
const showMigrationNotice = (): boolean => {
  const until = import.meta.env.VITE_MIGRATION_NOTICE_UNTIL;
  return !!until && new Date() <= new Date(`${until}T23:59:59`);
};

const Login = () => {
  const { t } = useTranslation('login');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<AUTH_ERRORS | 'generic' | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState<string>('');
  const resendVerification = useResendVerificationMutation();

  const schema = yup.object({
    email: yup.string().trim().email(t('form.email.invalid')).required(t('form.email.required')),
    password: yup.string().required(t('form.password.required')),
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    defaultValues: { email: '', password: '' },
    resolver: yupResolver(schema),
  });

  const onSubmit = async ({ email, password }: LoginForm) => {
    setError(null);
    setSubmittedEmail(email.trim());
    try {
      await login(email.trim(), password);
      const from = (location.state as { from?: { pathname?: string } })?.from?.pathname;
      navigate(from && from !== '/login' ? from : '/', { replace: true });
    } catch (err) {
      setError(getAuthErrorCode(err) ?? 'generic');
    }
  };

  const onResendVerification = () =>
    resendVerification.mutate(submittedEmail, {
      onSuccess: () => {
        toast.success(t('resend_verification.sent'));
      },
    });

  return (
    <AuthLayout title={t('title')}>
      {showMigrationNotice() && (
        <div className="rounded-lg bg-yellow-50 border border-yellow-300 p-4 text-sm">
          {t('migration_notice')}
        </div>
      )}

      {error && error !== AUTH_ERRORS.AUTH_012 && (
        <div role="alert" className="rounded-lg bg-red-50 border border-red-300 p-4 text-sm">
          <p>
            {error === 'generic' ? t('errors.generic') : InternalErrors.AUTH_ERRORS.getError(error)}
          </p>
          {error === AUTH_ERRORS.AUTH_003 && (
            <button
              type="button"
              className="mt-2 underline text-turquoise-700"
              onClick={onResendVerification}
              disabled={resendVerification.isLoading}
            >
              {t('resend_verification.button')}
            </button>
          )}
        </div>
      )}

      {error === AUTH_ERRORS.AUTH_012 && (
        <OpenAppBox
          title={t('volunteer_account.title')}
          description={t('volunteer_account.description')}
          email={submittedEmail}
        />
      )}

      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Controller
          name="email"
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <FormInput
              type="email"
              autoComplete="username"
              label={t('form.email.label')}
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              errorMessage={errors.email?.message}
            />
          )}
        />
        <Controller
          name="password"
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <FormInput
              type="password"
              autoComplete="current-password"
              label={t('form.password.label')}
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              errorMessage={errors.password?.message}
            />
          )}
        />
        <Link to="/forgot-password" className="text-sm underline self-end">
          {t('forgot_password')}
        </Link>
        <Button type="submit" label={t('submit')} disabled={isSubmitting} className="btn-primary" />
      </form>

      <p className="text-sm text-center">
        {t('no_account')}{' '}
        <Link to="/register" className="underline">
          {t('register')}
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Login;
