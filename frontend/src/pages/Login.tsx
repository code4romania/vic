import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import { AUTH_ERRORS } from '../common/errors/entities/auth.errors';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { useRequestLoginMutation } from '../services/auth/auth.service';
import { getAuthErrorCode } from '../common/utils/auth-error';
import AuthLayout from '../layouts/AuthLayout';
import OpenAppBox from '../components/OpenAppBox';

type LoginForm = { email: string };

// Shown until VITE_MIGRATION_NOTICE_UNTIL (YYYY-MM-DD) to people who had an account before the switch.
const showMigrationNotice = (): boolean => {
  const until = import.meta.env.VITE_MIGRATION_NOTICE_UNTIL;
  return !!until && new Date() <= new Date(`${until}T23:59:59`);
};

// VIC 2.0 (#514): no passwords. The admin types an email and gets a magic link (15 minutes) that opens
// /login/link. The answer is the same whether or not an account exists, except for a volunteer's email
// (AUTH_012: use the app).
const Login = () => {
  const { t } = useTranslation('login');
  const [error, setError] = useState<AUTH_ERRORS | 'generic' | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState<string>('');
  const requestLogin = useRequestLoginMutation();

  const schema = yup.object({
    email: yup.string().trim().email(t('form.email.invalid')).required(t('form.email.required')),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    defaultValues: { email: '' },
    resolver: yupResolver(schema),
  });

  const send = (email: string, onSent?: () => void) => {
    setError(null);
    setSubmittedEmail(email);
    requestLogin.mutate(email, {
      onSuccess: () => {
        setSentTo(email);
        onSent?.();
      },
      onError: (err) => setError(getAuthErrorCode(err) ?? 'generic'),
    });
  };

  const onSubmit = ({ email }: LoginForm) => send(email.trim());

  const onSendAgain = () => {
    if (sentTo) send(sentTo, () => toast.success(t('sent.again_done')));
  };

  const errorBox = error && error !== AUTH_ERRORS.AUTH_012 && (
    <div role="alert" className="rounded-lg bg-red-50 border border-red-300 p-4 text-sm">
      {error === 'generic' ? t('errors.generic') : InternalErrors.AUTH_ERRORS.getError(error)}
    </div>
  );

  if (sentTo) {
    return (
      <AuthLayout title={t('sent.title')}>
        <div role="status" className="rounded-lg bg-green-50 border border-green-300 p-4 text-sm">
          {t('sent.description', { email: sentTo })}
        </div>
        {errorBox}
        <p className="text-sm text-cool-gray-500">{t('sent.hint')}</p>
        <Button
          type="button"
          label={t('sent.again')}
          className="btn-outline-secondary"
          onClick={onSendAgain}
          disabled={requestLogin.isLoading}
        />
        <button
          type="button"
          className="text-sm underline self-center"
          onClick={() => {
            setSentTo(null);
            setError(null);
          }}
        >
          {t('sent.other_email')}
        </button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title={t('title')}>
      {showMigrationNotice() && (
        <div className="rounded-lg bg-yellow-50 border border-yellow-300 p-4 text-sm">
          {t('migration_notice')}
        </div>
      )}

      {errorBox}

      {error === AUTH_ERRORS.AUTH_012 && (
        <OpenAppBox
          title={t('volunteer_account.title')}
          description={t('volunteer_account.description')}
          email={submittedEmail}
        />
      )}

      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <p className="text-sm text-cool-gray-500">{t('description')}</p>
        <Controller
          name="email"
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <FormInput
              type="email"
              autoComplete="email"
              label={t('form.email.label')}
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              errorMessage={errors.email?.message}
            />
          )}
        />
        <Button
          type="submit"
          label={t('submit')}
          disabled={requestLogin.isLoading}
          className="btn-primary"
        />
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
