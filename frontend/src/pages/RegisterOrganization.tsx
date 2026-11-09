import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import logo from '../assets/images/app_logo.svg';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import Turnstile from '../components/Turnstile';
import { OrganizationFields, organizationFieldsSchema } from '../components/OrganizationFields';
import { useRegisterOrganizationMutation } from '../services/organization/organization.service';
import { IRegisterOrganization } from '../common/interfaces/organization.interface';
import { ORGANIZATION_ERRORS } from '../common/errors/entities/organization.errors';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { getAuthErrorCode } from '../common/utils/auth-error';

type RegisterForm = Omit<IRegisterOrganization, 'turnstileToken'>;

const DEFAULTS: RegisterForm = {
  name: '',
  email: '',
  phone: '',
  taxId: '',
  firstName: '',
  lastName: '',
  adminEmail: '',
  adminPhone: '',
  acceptedTerms: false,
  declaresRegisteredNgo: false,
  declaresRepresentative: false,
};

// /register: an NGO and its first admin. The admin confirms the email, then the NGO waits for a super
// admin's validation (decision 1), on its CUI. Turnstile. #469: only name, CUI, email and phone; the
// description, address, website and logo are filled in later from the Organization page.
const RegisterOrganization = () => {
  const { t, i18n } = useTranslation('register_organization');
  const [turnstileToken, setTurnstileToken] = useState<string>('');
  const [turnstileKey, setTurnstileKey] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [registered, setRegistered] = useState<{ name: string; maskedEmail: string } | null>(null);
  const register = useRegisterOrganizationMutation();

  const schema = yup.object({
    ...organizationFieldsSchema,
    firstName: yup
      .string()
      .trim()
      .required(t('form.required'))
      .min(2, t('form.min', { value: 2 }))
      .max(50, t('form.max', { value: 50 })),
    lastName: yup
      .string()
      .trim()
      .required(t('form.required'))
      .min(2, t('form.min', { value: 2 }))
      .max(50, t('form.max', { value: 50 })),
    adminEmail: yup.string().trim().required(t('form.required')).email(t('form.email_invalid')),
    adminPhone: yup
      .string()
      .trim()
      .required(t('form.required'))
      .max(20, t('form.max', { value: 20 })),
    acceptedTerms: yup.boolean().oneOf([true], t('form.terms.required')).required(),
    declaresRegisteredNgo: yup.boolean().oneOf([true], t('form.declaration.required')).required(),
    declaresRepresentative: yup.boolean().oneOf([true], t('form.declaration.required')).required(),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({ defaultValues: DEFAULTS, resolver: yupResolver(schema) });

  const onSubmit = (form: RegisterForm) => {
    setError(null);
    if (!turnstileToken) {
      setError(t('errors.turnstile_missing'));
      return;
    }

    register.mutate(
      { data: { ...form, turnstileToken }, files: {} },
      {
        onSuccess: ({ maskedEmail }) => setRegistered({ name: form.name.trim(), maskedEmail }),
        onError: (err) => {
          // A Turnstile token is single use: get a fresh one for the next try.
          setTurnstileToken('');
          setTurnstileKey((key) => key + 1);
          const code = err.response?.data?.code_error;
          if (code === ORGANIZATION_ERRORS.ORG_004 || code === ORGANIZATION_ERRORS.ORG_006) {
            setError(InternalErrors.ORGANIZATION_ERRORS.getError(code));
            return;
          }
          const authCode = getAuthErrorCode(err);
          setError(authCode ? InternalErrors.AUTH_ERRORS.getError(authCode) : t('errors.generic'));
        },
      },
    );
  };

  const adminField = (
    name: 'firstName' | 'lastName' | 'adminEmail' | 'adminPhone',
    type = 'text',
    autoComplete?: string,
  ) => (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, onBlur, value } }) => (
        <FormInput
          type={type}
          autoComplete={autoComplete}
          label={t(`form.${name}.label`)}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          errorMessage={errors[name]?.message}
        />
      )}
    />
  );

  const termsUrl = import.meta.env.VITE_TERMS_URL;
  const privacyUrl = import.meta.env.VITE_PRIVACY_URL;

  return (
    <div className="min-h-[100vh] w-full bg-gray-50 px-4 py-8">
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
        <Link to="/" className="self-center">
          <img src={logo} alt="VIC" className="max-h-11" />
        </Link>
        <h1 className="font-robotoBold text-2xl text-center">{t('title')}</h1>

        {registered ? (
          <div
            role="status"
            className="bg-white rounded-lg shadow p-8 flex flex-col gap-4 text-center"
          >
            <h2 className="font-robotoBold text-lg">
              {t('success.title', { organization: registered.name })}
            </h2>
            <p className="text-cool-gray-500">
              {t('success.description', { email: registered.maskedEmail })}
            </p>
            <Link to="/login" className="underline">
              {t('success.login')}
            </Link>
          </div>
        ) : (
          <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)} noValidate>
            <p className="text-cool-gray-500 text-center">{t('description')}</p>

            <section className="bg-white rounded-lg shadow p-6 flex flex-col gap-4">
              <h2 className="font-robotoBold text-lg">{t('organization_card')}</h2>
              <OrganizationFields control={control} errors={errors} />
            </section>

            <section className="bg-white rounded-lg shadow p-6 flex flex-col gap-4">
              <h2 className="font-robotoBold text-lg">{t('admin_card')}</h2>
              <p className="text-sm text-cool-gray-500">{t('admin_card_description')}</p>
              {adminField('firstName', 'text', 'given-name')}
              {adminField('lastName', 'text', 'family-name')}
              {adminField('adminEmail', 'email', 'email')}
              {adminField('adminPhone', 'tel', 'tel')}
            </section>

            <section className="bg-white rounded-lg shadow p-6 flex flex-col gap-4">
              {/* #510: self-declaration instead of the statute; a super admin still validates the NGO */}
              <h3 className="font-semibold">{t('form.declaration.title')}</h3>
              {(['declaresRegisteredNgo', 'declaresRepresentative'] as const).map((name) => (
                <div key={name} className="flex flex-col gap-1">
                  <Controller
                    name={name}
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <label className="flex items-start gap-2 text-sm">
                        <input
                          type="checkbox"
                          className="mt-1"
                          checked={value}
                          onChange={(event) => onChange(event.target.checked)}
                        />
                        <span>{t(`form.declaration.${name}`)}</span>
                      </label>
                    )}
                  />
                  {errors[name] && <p className="text-red-500 text-sm">{errors[name]?.message}</p>}
                </div>
              ))}
              <Controller
                name="acceptedTerms"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <label className="flex items-start gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={value}
                      onChange={(event) => onChange(event.target.checked)}
                    />
                    <span>
                      {t('form.terms.label')}{' '}
                      {termsUrl && (
                        <a className="underline" href={termsUrl} target="_blank" rel="noreferrer">
                          {t('form.terms.terms')}
                        </a>
                      )}
                      {termsUrl && privacyUrl && ` ${t('form.terms.and')} `}
                      {privacyUrl && (
                        <a className="underline" href={privacyUrl} target="_blank" rel="noreferrer">
                          {t('form.terms.privacy')}
                        </a>
                      )}
                    </span>
                  </label>
                )}
              />
              {errors.acceptedTerms && (
                <p className="text-red-500 text-sm">{errors.acceptedTerms.message}</p>
              )}
              <Turnstile
                onToken={setTurnstileToken}
                resetKey={turnstileKey}
                language={i18n.language}
              />
              {error && (
                <div
                  role="alert"
                  className="rounded-lg bg-red-50 border border-red-300 p-4 text-sm"
                >
                  {error}
                </div>
              )}
              <Button
                type="submit"
                label={t('submit')}
                disabled={register.isLoading}
                className="btn-primary self-start"
              />
            </section>

            <p className="text-sm text-center">
              {t('has_account')}{' '}
              <Link to="/login" className="underline">
                {t('login')}
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default RegisterOrganization;
