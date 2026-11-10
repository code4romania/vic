import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { EnvelopeIcon, EnvelopeOpenIcon } from '@heroicons/react/24/outline';
import FormInput from '../components/FormInput';
import { toastOptions } from '../hooks/useToast';
import Button from '../components/Button';
import { AUTH_ERRORS } from '../common/errors/entities/auth.errors';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { useRequestLoginMutation } from '../services/auth/auth.service';
import { getAuthErrorCode } from '../common/utils/auth-error';
import AuthShell, { AuthNotice } from '../components/AuthShell';
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
    if (sentTo) send(sentTo, () => toast.success(t('sent.again_done'), toastOptions('success')));
  };

  const errorBox = error && error !== AUTH_ERRORS.AUTH_012 && (
    <AuthNotice tone="error">
      {error === 'generic' ? t('errors.generic') : InternalErrors.AUTH_ERRORS.getError(error)}
    </AuthNotice>
  );

  if (sentTo) {
    return (
      <AuthShell
        title={t('sent.title')}
        icon={<EnvelopeOpenIcon className="w-6 h-6" aria-hidden="true" />}
      >
        <AuthNotice tone="success">{t('sent.description', { email: sentTo })}</AuthNotice>
        {errorBox}
        <p className="text-sm text-cool-gray-500">{t('sent.hint')}</p>
        <div className="flex flex-col gap-3">
          <Button
            type="button"
            label={t('sent.again')}
            className="btn-outline-secondary w-full"
            onClick={onSendAgain}
            disabled={requestLogin.isLoading}
          />
          <button
            type="button"
            className="btn-text-primary w-full"
            onClick={() => {
              setSentTo(null);
              setError(null);
            }}
          >
            {t('sent.other_email')}
          </button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title={t('title')}
      subtitle={t('description')}
      icon={<EnvelopeIcon className="w-6 h-6" aria-hidden="true" />}
    >
      {showMigrationNotice() && <AuthNotice tone="warning">{t('migration_notice')}</AuthNotice>}

      {errorBox}

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
              autoComplete="email"
              placeholder={t('form.email.placeholder')}
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
          className="btn-primary w-full"
        />
        <p className="text-xs text-cool-gray-500 text-center">{t('no_password')}</p>
      </form>

      <div className="flex flex-col gap-3 pt-6 border-t border-cool-gray-200">
        <p className="text-sm text-cool-gray-600 text-center">{t('no_account')}</p>
        <Link to="/register" className="btn-outline-secondary w-full">
          {t('register')}
        </Link>
      </div>
    </AuthShell>
  );
};

export default Login;
