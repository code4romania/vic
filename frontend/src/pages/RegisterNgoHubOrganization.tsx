import React, { ReactNode, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BuildingOffice2Icon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import AuthShell, { AuthNotice } from '../components/AuthShell';
import Button from '../components/Button';
import FormInput from '../components/FormInput';
import FormTextarea from '../components/FormTextarea';
import NgoHubLoginButton from '../components/NgoHubLoginButton';
import TermsLabel from '../components/TermsLabel';
import { organizationProfileSchema } from '../components/OrganizationFields';
import { useAuth } from '../hooks/useAuth';
import { useRevalidateOnLanguageChange } from '../hooks/useRevalidateOnLanguageChange';
import { useRegisterNgoHubOrganizationMutation } from '../services/auth/auth.service';
import { INgoHubRegisterForm, INgoHubRegistration } from '../common/interfaces/auth.interface';
import { AUTH_ERRORS } from '../common/errors/entities/auth.errors';
import { ORGANIZATION_ERRORS } from '../common/errors/entities/organization.errors';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { getAuthErrorCode } from '../common/utils/auth-error';

// /register/ngohub: an NGO Hub admin whose organization VIC does not know yet. The form starts from what
// NGO Hub has (the callback passes it in the history state). The CUI, the organization's name and the
// admin's email are shown, not editable: the API takes them from the ticket. The NGO is in at once.
const RegisterNgoHubOrganization = () => {
  const { t } = useTranslation(['ngohub', 'register_organization']);
  const location = useLocation();
  const navigate = useNavigate();
  const { startSession } = useAuth();
  const registration = location.state as INgoHubRegistration | null;
  const [expired, setExpired] = useState<boolean>(!registration?.ticket);
  const [error, setError] = useState<string | null>(null);
  const register = useRegisterNgoHubOrganizationMutation();
  const label = (name: string) => t(`register_organization:form.${name}.label`);
  const required = t('register_organization:form.required');

  const profile = organizationProfileSchema();
  const person = yup
    .string()
    .trim()
    .required(required)
    .min(2, t('register_organization:form.min', { value: 2 }))
    .max(50, t('register_organization:form.max', { value: 50 }));
  const schema = yup.object({
    email: profile.email,
    phone: profile.phone,
    address: profile.address,
    website: profile.website,
    description: profile.description,
    firstName: person,
    lastName: person,
    adminPhone: yup
      .string()
      .trim()
      .required(required)
      .max(20, t('register_organization:form.max', { value: 20 })),
    useNgoHubLogo: yup.boolean().required(),
    acceptedTerms: yup
      .boolean()
      .oneOf([true], t('register_organization:form.terms.required'))
      .required(),
  });

  const prefill = registration?.prefill;
  const {
    control,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<INgoHubRegisterForm>({
    defaultValues: {
      email: prefill?.organization.email ?? '',
      phone: prefill?.organization.phone ?? '',
      address: prefill?.organization.address ?? '',
      website: prefill?.organization.website ?? '',
      description: prefill?.organization.description ?? '',
      firstName: prefill?.admin.firstName ?? '',
      lastName: prefill?.admin.lastName ?? '',
      adminPhone: '',
      useNgoHubLogo: !!prefill?.organization.logoUrl,
      acceptedTerms: false,
    },
    resolver: yupResolver(schema),
  });
  useRevalidateOnLanguageChange(trigger, errors);

  if (expired || !registration || !prefill) {
    return (
      <AuthShell
        title={t('register.expired_title')}
        icon={<ExclamationTriangleIcon className="w-6 h-6" aria-hidden="true" />}
      >
        <AuthNotice tone="warning">{t('register.expired')}</AuthNotice>
        <div className="flex flex-col gap-3">
          <NgoHubLoginButton />
          <Link to="/login" className="btn-text-primary w-full text-center">
            {t('callback.back_to_login')}
          </Link>
        </div>
      </AuthShell>
    );
  }

  const onSubmit = (form: INgoHubRegisterForm) => {
    setError(null);
    register.mutate(
      { ticket: registration.ticket, form },
      {
        onSuccess: async (session) => {
          await startSession(session);
          navigate('/', { replace: true });
        },
        onError: (err) => {
          const code = err.response?.data?.code_error as string | undefined;
          if (code === ORGANIZATION_ERRORS.ORG_004) {
            // The ticket is used up by any attempt; a new one comes from logging in again.
            setError(InternalErrors.ORGANIZATION_ERRORS.getError(code));
            return;
          }
          const authCode = getAuthErrorCode(err);
          if (authCode === AUTH_ERRORS.AUTH_019) {
            setExpired(true);
            return;
          }
          setError(
            authCode
              ? InternalErrors.AUTH_ERRORS.getError(authCode)
              : t('register_organization:errors.generic'),
          );
        },
      },
    );
  };

  const locked = (name: string, value: string) => (
    <FormInput readOnly label={label(name)} value={value} />
  );

  const text = (
    name: keyof Omit<INgoHubRegisterForm, 'useNgoHubLogo' | 'acceptedTerms'>,
    options: { type?: string; textarea?: boolean; labelKey?: string } = {},
  ) => (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, onBlur, value } }) =>
        options.textarea ? (
          <FormTextarea
            label={label(options.labelKey ?? name)}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            errorMessage={errors[name]?.message}
          />
        ) : (
          <FormInput
            type={options.type ?? 'text'}
            label={label(options.labelKey ?? name)}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            errorMessage={errors[name]?.message}
          />
        )
      }
    />
  );

  const checkbox = (checked: boolean, onChange: (value: boolean) => void, content: ReactNode) => (
    <label className="flex items-start gap-3 rounded-lg border border-cool-gray-200 p-4 text-sm cursor-pointer">
      <input
        type="checkbox"
        className="mt-0.5 h-4 w-4 rounded border-cool-gray-300 text-navy focus:ring-navy"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="text-cool-gray-800">{content}</span>
    </label>
  );

  return (
    <AuthShell
      wide
      title={t('register.title')}
      subtitle={t('register.description')}
      icon={<BuildingOffice2Icon className="w-6 h-6" aria-hidden="true" />}
    >
      <form className="flex flex-col gap-8" onSubmit={handleSubmit(onSubmit)} noValidate>
        <section className="flex flex-col gap-4">
          <h2>{t('register.organization_card')}</h2>
          <p className="text-xs text-cool-gray-500">{t('register.locked')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {locked('name', prefill.organization.name)}
            {locked('taxId', prefill.organization.taxId)}
            {text('email', { type: 'email' })}
            {text('phone', { type: 'tel' })}
            {text('address')}
            {text('website', { type: 'url' })}
          </div>
          {text('description', { textarea: true })}
          {prefill.organization.logoUrl && (
            <Controller
              name="useNgoHubLogo"
              control={control}
              render={({ field: { onChange, value } }) =>
                checkbox(
                  value,
                  onChange,
                  <span className="flex items-center gap-3">
                    <img
                      src={prefill.organization.logoUrl as string}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 object-contain rounded"
                    />
                    {t('register.logo')}
                  </span>,
                )
              }
            />
          )}
        </section>

        <section className="flex flex-col gap-4 pt-6 border-t border-cool-gray-200">
          <h2>{t('register.admin_card')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {text('firstName')}
            {text('lastName')}
            {locked('adminEmail', prefill.admin.email)}
            {text('adminPhone', { type: 'tel' })}
          </div>
        </section>

        <section className="flex flex-col gap-4 pt-6 border-t border-cool-gray-200">
          <Controller
            name="acceptedTerms"
            control={control}
            render={({ field: { onChange, value } }) => checkbox(value, onChange, <TermsLabel />)}
          />
          {errors.acceptedTerms && (
            <p className="text-red-500 text-sm">{errors.acceptedTerms.message}</p>
          )}
          {error && <AuthNotice tone="error">{error}</AuthNotice>}
          <Button
            type="submit"
            label={t('register.submit')}
            disabled={register.isLoading}
            className="btn-primary w-full sm:w-auto sm:self-start"
          />
        </section>
      </form>
    </AuthShell>
  );
};

export default RegisterNgoHubOrganization;
