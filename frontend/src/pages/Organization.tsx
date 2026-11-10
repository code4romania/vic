import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { BuildingOffice2Icon, CheckBadgeIcon, ClockIcon } from '@heroicons/react/24/outline';
import i18n from '../common/config/i18n';
import { DivisionType } from '../common/enums/division-type.enum';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { IOrganizationFields } from '../common/interfaces/organization.interface';
import { formatDate } from '../common/utils/utils';
import ActivityTypeChips from '../components/ActivityTypeChips';
import CardBody from '../components/CardBody';
import CardHeader from '../components/CardHeader';
import DivisionChips from '../components/DivisionChips';
import EmptyContent from '../components/EmptyContent';
import FormInput from '../components/FormInput';
import FormTextarea from '../components/FormTextarea';
import LoadingContent from '../components/LoadingContent';
import { OrganizationLogo, organizationProfileSchema } from '../components/OrganizationFields';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { useErrorToast, useSuccessToast } from '../hooks/useToast';
import Card from '../layouts/CardLayout';
import PageLayout from '../layouts/PageLayout';
import {
  useOrganizationQuery,
  useUpdateOrganizationMutation,
} from '../services/organization/organization.service';

const schema = yup.object(organizationProfileSchema).required();

const t = (key: string, options?: Record<string, unknown>): string =>
  `${i18n.t(`organization:setup.${key}`, options)}`;
const label = (name: string): string => `${i18n.t(`register_organization:form.${name}.label`)}`;

type Field = keyof IOrganizationFields;

// "Configurare organizație" (VIC 2.0 web design): the public profile edited in place, with the CUI
// and its validation status (#469), the logo, and departments, roles, branches and activity types as
// chips. No activity area, no statute and no NGO Hub sync.
const Organization = () => {
  const [logo, setLogo] = useState<File | null>(null);
  const { data: organization, error, isLoading, refetch } = useOrganizationQuery();
  const { mutate: updateOrganization, isLoading: isSaving } = useUpdateOrganizationMutation();

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty },
  } = useForm<Required<IOrganizationFields>>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (organization)
      reset({
        name: organization.name,
        email: organization.email,
        phone: organization.phone,
        taxId: organization.taxId ?? '',
        address: organization.address ?? '',
        website: organization.website ?? '',
        description: organization.description ?? '',
      });
  }, [organization]);

  useEffect(() => {
    if (error)
      useErrorToast(
        InternalErrors.ORGANIZATION_ERRORS.getError(error.response?.data.code_error),
        'organization_error',
      );
  }, [error]);

  const onSubmit = (data: Required<IOrganizationFields>) =>
    updateOrganization(
      { data, files: { logo } },
      {
        onSuccess: () => {
          useSuccessToast(i18n.t('organization:submit.success'));
          setLogo(null);
          refetch();
        },
        onError: (saveError) =>
          useErrorToast(
            InternalErrors.ORGANIZATION_ERRORS.getError(saveError.response?.data.code_error),
          ),
      },
    );

  const field = (
    name: Field,
    options: { type?: string; textarea?: boolean; placeholder?: string; wide?: boolean } = {},
  ) => (
    <div className={options.wide ? 'md:col-span-2' : ''}>
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, onBlur, value } }) =>
          options.textarea ? (
            <FormTextarea
              label={label(name)}
              value={value ?? ''}
              onChange={onChange}
              onBlur={onBlur}
              errorMessage={errors[name]?.message as string}
            />
          ) : (
            <FormInput
              type={options.type ?? 'text'}
              label={label(name)}
              placeholder={options.placeholder}
              value={value ?? ''}
              onChange={onChange}
              onBlur={onBlur}
              className="max-w-none"
              errorMessage={errors[name]?.message as string}
            />
          )
        }
      />
    </div>
  );

  return (
    <PageLayout>
      <PageHeader
        subtitle={t('subtitle')}
        actions={
          organization && (
            <button
              type="button"
              className="btn-primary"
              disabled={isSaving || (!isDirty && !logo)}
              onClick={handleSubmit(onSubmit)}
            >
              {t('save')}
            </button>
          )
        }
      >
        {t('title')}
      </PageHeader>
      {isLoading && <LoadingContent />}
      {error && !organization && (
        <EmptyContent
          description={InternalErrors.ORGANIZATION_ERRORS.getError(error.response?.data.code_error)}
        />
      )}
      {organization && (
        <>
          <div className="flex gap-3 rounded-xl border border-navy/20 bg-navy-50 p-4 sm:p-5">
            <BuildingOffice2Icon className="w-6 h-6 shrink-0 text-navy" aria-hidden="true" />
            <div>
              <p className="font-robotoMedium text-navy">{t('public_banner.title')}</p>
              <p className="text-sm text-cool-gray-700">{t('public_banner.text')}</p>
            </div>
          </div>
          <Card>
            <CardHeader>
              <div className="flex items-start gap-3">
                <BuildingOffice2Icon className="mt-0.5 w-5 h-5 text-navy" aria-hidden="true" />
                <div>
                  <h2>{t('info.title')}</h2>
                  <p className="text-sm text-cool-gray-500">{t('info.subtitle')}</p>
                </div>
              </div>
              {organization.validatedAt ? (
                <StatusBadge tone="green">
                  <CheckBadgeIcon className="w-4 h-4 mr-1" aria-hidden="true" />
                  {t('info.validated', { date: formatDate(organization.validatedAt) })}
                </StatusBadge>
              ) : (
                <StatusBadge tone="amber">
                  <ClockIcon className="w-4 h-4 mr-1" aria-hidden="true" />
                  {i18n.t('organization:not_validated')}
                </StatusBadge>
              )}
            </CardHeader>
            <CardBody>
              <form
                className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4"
                onSubmit={handleSubmit(onSubmit)}
              >
                {field('name')}
                {field('email', { type: 'email' })}
                {field('phone', { type: 'tel' })}
                {field('taxId', { placeholder: 'RO12345678' })}
                {field('address', { wide: true })}
                {field('website', { type: 'url', placeholder: 'https://', wide: true })}
                {field('description', { textarea: true, wide: true })}
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-[auto_1fr] gap-4 items-start">
                  <div className="flex flex-col gap-1">
                    <small className="text-cool-gray-500">{t('logo.current')}</small>
                    {organization.logo ? (
                      <img
                        src={organization.logo}
                        alt={t('logo.current')}
                        className="h-24 w-24 object-contain rounded-lg border border-cool-gray-200 p-2 bg-white"
                      />
                    ) : (
                      <span className="h-24 w-24 rounded-lg border border-dashed border-cool-gray-300 flex items-center justify-center text-xs text-cool-gray-500">
                        {t('logo.none')}
                      </span>
                    )}
                  </div>
                  <OrganizationLogo
                    onLogo={setLogo}
                    logoLabel={`${i18n.t('organization:replace_logo')}`}
                  />
                </div>
              </form>
            </CardBody>
          </Card>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
            <DivisionChips type={DivisionType.DEPARTMENT} />
            <DivisionChips type={DivisionType.ROLE} />
            <ActivityTypeChips />
            <DivisionChips type={DivisionType.BRANCH} />
          </div>
        </>
      )}
    </PageLayout>
  );
};

export default Organization;
