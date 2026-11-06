import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import AuthLayout from '../layouts/AuthLayout';
import { useForgotPasswordMutation } from '../services/auth/auth.service';
import { getAuthErrorCode } from '../common/utils/auth-error';
import { AUTH_ERRORS } from '../common/errors/entities/auth.errors';
import { InternalErrors } from '../common/errors/internal-errors.class';

type ForgotPasswordForm = { email: string };

// Always the same answer: the page never says whether an account exists.
const ForgotPassword = () => {
  const { t } = useTranslation('forgot_password');
  const [sent, setSent] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const forgotPassword = useForgotPasswordMutation();

  const schema = yup.object({
    email: yup.string().trim().email(t('email.invalid')).required(t('email.required')),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({ defaultValues: { email: '' }, resolver: yupResolver(schema) });

  const onSubmit = ({ email }: ForgotPasswordForm) => {
    setError(null);
    forgotPassword.mutate(email.trim(), {
      onSuccess: () => setSent(true),
      onError: (err) => {
        const code = getAuthErrorCode(err);
        setError(
          code === AUTH_ERRORS.AUTH_010
            ? InternalErrors.AUTH_ERRORS.getError(code)
            : t('errors.generic'),
        );
      },
    });
  };

  return (
    <AuthLayout title={t('title')}>
      {sent ? (
        <div role="status" className="rounded-lg bg-green-50 border border-green-300 p-4 text-sm">
          {t('sent')}
        </div>
      ) : (
        <>
          <p className="text-sm text-cool-gray-500">{t('description')}</p>
          {error && (
            <div role="alert" className="rounded-lg bg-red-50 border border-red-300 p-4 text-sm">
              {error}
            </div>
          )}
          <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Controller
              name="email"
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  type="email"
                  autoComplete="username"
                  label={t('email.label')}
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
              disabled={forgotPassword.isLoading}
              className="btn-primary"
            />
          </form>
        </>
      )}
      <Link to="/login" className="text-sm underline text-center">
        {t('back_to_login')}
      </Link>
    </AuthLayout>
  );
};

export default ForgotPassword;
