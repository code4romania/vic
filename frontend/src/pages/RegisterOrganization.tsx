import React, { ReactNode, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import AuthShell, { AuthNotice } from '../components/AuthShell';
import { BuildingOffice2Icon, CheckBadgeIcon, EnvelopeOpenIcon } from '@heroicons/react/24/outline';
import { OrganizationFields, organizationFieldsSchema } from '../components/OrganizationFields';
import { useRegisterOrganizationMutation } from '../services/organization/organization.service';
import { IRegisterOrganization } from '../common/interfaces/organization.interface';
import { ORGANIZATION_ERRORS } from '../common/errors/entities/organization.errors';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { getAuthErrorCode } from '../common/utils/auth-error';

type RegisterForm = IRegisterOrganization;

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
// admin's validation (decision 1), on its CUI. #469: only name, CUI, email and phone; the
// description, address, website and logo are filled in later from the Organization page.
const RegisterOrganization = () => {
  const { t } = useTranslation('register_organization');
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
    register.mutate(
      { data: form, files: {} },
      {
        onSuccess: ({ maskedEmail }) => setRegistered({ name: form.name.trim(), maskedEmail }),
        onError: (err) => {
          const code = err.response?.data?.code_error;
          if (code === ORGANIZATION_ERRORS.ORG_004) {
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

  const checkbox = (checked: boolean, onChange: (value: boolean) => void, label: ReactNode) => (
    <label
      className={`flex items-start gap-3 rounded-lg border p-4 text-sm cursor-pointer ${
        checked ? 'border-navy bg-navy-50' : 'border-cool-gray-200 bg-white hover:bg-cool-gray-50'
      }`}
    >
      <input
        type="checkbox"
        className="mt-0.5 h-4 w-4 rounded border-cool-gray-300 text-navy focus:ring-navy"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="text-cool-gray-800">{label}</span>
    </label>
  );

  const step = (index: number, title: string, description?: string) => (
    <div className="flex items-start gap-3">
      <span className="w-7 h-7 shrink-0 rounded-full bg-navy text-yellow text-sm font-robotoBold flex items-center justify-center">
        {index}
      </span>
      <div>
        <h2>{title}</h2>
        {description && <p className="text-sm text-cool-gray-500">{description}</p>}
      </div>
    </div>
  );

  if (registered) {
    return (
      <AuthShell
        title={t('success.title', { organization: registered.name })}
        icon={<EnvelopeOpenIcon className="w-6 h-6" aria-hidden="true" />}
      >
        <AuthNotice tone="success">
          {t('success.description', { email: registered.maskedEmail })}
        </AuthNotice>
        <ol className="flex flex-col gap-3 text-sm text-cool-gray-700">
          {(['confirm', 'validation', 'volunteers'] as const).map((key, index) => (
            <li key={key} className="flex items-start gap-3">
              <span className="w-6 h-6 shrink-0 rounded-full bg-cool-gray-100 text-cool-gray-700 text-xs font-robotoBold flex items-center justify-center">
                {index + 1}
              </span>
              <span>{t(`success.next.${key}`)}</span>
            </li>
          ))}
        </ol>
        <Link to="/login" className="btn-outline-secondary w-full">
          {t('success.login')}
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      wide
      title={t('title')}
      subtitle={t('description')}
      icon={<BuildingOffice2Icon className="w-6 h-6" aria-hidden="true" />}
    >
      <form className="flex flex-col gap-8" onSubmit={handleSubmit(onSubmit)} noValidate>
        <section className="flex flex-col gap-4">
          {step(1, t('organization_card'), t('organization_card_description'))}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <OrganizationFields control={control} errors={errors} />
          </div>
        </section>

        <section className="flex flex-col gap-4 pt-6 border-t border-cool-gray-200">
          {step(2, t('admin_card'), t('admin_card_description'))}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {adminField('firstName', 'text', 'given-name')}
            {adminField('lastName', 'text', 'family-name')}
            {adminField('adminEmail', 'email', 'email')}
            {adminField('adminPhone', 'tel', 'tel')}
          </div>
        </section>

        <section className="flex flex-col gap-4 pt-6 border-t border-cool-gray-200">
          {/* #510: self-declaration instead of the statute; a super admin still validates the NGO */}
          {step(3, t('form.declaration.title'), t('form.declaration.description'))}
          {(['declaresRegisteredNgo', 'declaresRepresentative'] as const).map((name) => (
            <div key={name} className="flex flex-col gap-1">
              <Controller
                name={name}
                control={control}
                render={({ field: { onChange, value } }) =>
                  checkbox(value, onChange, t(`form.declaration.${name}`))
                }
              />
              {errors[name] && <p className="text-red-500 text-sm">{errors[name]?.message}</p>}
            </div>
          ))}
          <Controller
            name="acceptedTerms"
            control={control}
            render={({ field: { onChange, value } }) =>
              checkbox(
                value,
                onChange,
                <>
                  {t('form.terms.label')}{' '}
                  {termsUrl && (
                    <a
                      className="text-sm text-navy underline"
                      href={termsUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {t('form.terms.terms')}
                    </a>
                  )}
                  {termsUrl && privacyUrl && ` ${t('form.terms.and')} `}
                  {privacyUrl && (
                    <a
                      className="text-sm text-navy underline"
                      href={privacyUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {t('form.terms.privacy')}
                    </a>
                  )}
                </>,
              )
            }
          />
          {errors.acceptedTerms && (
            <p className="text-red-500 text-sm">{errors.acceptedTerms.message}</p>
          )}
          {error && <AuthNotice tone="error">{error}</AuthNotice>}
          <div className="flex items-start gap-3 rounded-lg bg-cool-gray-50 border border-cool-gray-200 p-4 text-sm text-cool-gray-700">
            <CheckBadgeIcon className="w-5 h-5 shrink-0 text-navy" aria-hidden="true" />
            <span>{t('validation_note')}</span>
          </div>
          <Button
            type="submit"
            label={t('submit')}
            disabled={register.isLoading}
            className="btn-primary w-full sm:w-auto sm:self-start"
          />
        </section>
      </form>

      <p className="text-sm text-center text-cool-gray-600 pt-6 border-t border-cool-gray-200">
        {t('has_account')}{' '}
        <Link to="/login" className="text-sm text-navy underline">
          {t('login')}
        </Link>
      </p>
    </AuthShell>
  );
};

export default RegisterOrganization;
