import React from 'react';
import { Control, Controller, FieldErrors, FieldValues, Path } from 'react-hook-form';
import * as yup from 'yup';
import i18n from '../common/config/i18n';
import FormInput from './FormInput';
import FormTextarea from './FormTextarea';
import FileUpload from './FileUpload';
import { IOrganizationFields } from '../common/interfaces/organization.interface';

export const STATUTE_MAX_BYTES = 10 * 1024 * 1024;
export const LOGO_MAX_BYTES = 5 * 1024 * 1024;

const t = (key: string, options?: Record<string, unknown>) =>
  i18n.t(`register_organization:form.${key}`, options) as string;

// The same rules as backend/src/api/organization/dto/organization-fields.ts.
export const organizationFieldsSchema = {
  name: yup
    .string()
    .trim()
    .required(t('required'))
    .min(2, t('min', { value: 2 }))
    .max(100, t('max', { value: 100 })),
  email: yup.string().trim().required(t('required')).email(t('email_invalid')),
  phone: yup
    .string()
    .trim()
    .required(t('required'))
    .max(20, t('max', { value: 20 })),
  address: yup
    .string()
    .trim()
    .required(t('required'))
    .min(2, t('min', { value: 2 }))
    .max(500, t('max', { value: 500 })),
  activityArea: yup
    .string()
    .trim()
    .required(t('required'))
    .min(2, t('min', { value: 2 }))
    .max(200, t('max', { value: 200 })),
  description: yup
    .string()
    .trim()
    .required(t('required'))
    .min(50, t('min', { value: 50 }))
    .max(250, t('max', { value: 250 })),
  website: yup
    .string()
    .ensure()
    .trim()
    .max(300, t('max', { value: 300 }))
    .test('url', t('website_invalid'), (value) => !value || /^https?:\/\/\S+\.\S+/.test(value)),
  taxId: yup
    .string()
    .trim()
    .required(t('required'))
    .matches(/^(RO)?\d{2,10}$/i, t('tax_id_invalid')),
};

export const isPdf = (file?: File | null): boolean =>
  !!file && (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'));

interface OrganizationFieldsProps<T extends FieldValues & IOrganizationFields> {
  control: Control<T>;
  errors: FieldErrors<T>;
}

// Text fields of the organization card. The address is free text (no county or city select, R6).
export const OrganizationFields = <T extends FieldValues & IOrganizationFields>({
  control,
  errors,
}: OrganizationFieldsProps<T>) => {
  const field = (
    name: keyof IOrganizationFields,
    options: { type?: string; textarea?: boolean; placeholder?: string } = {},
  ) => (
    <Controller
      key={name}
      name={name as Path<T>}
      control={control}
      render={({ field: { onChange, onBlur, value } }) =>
        options.textarea ? (
          <FormTextarea
            label={t(`${name}.label`)}
            value={value ?? ''}
            onChange={onChange}
            onBlur={onBlur}
            errorMessage={errors[name]?.message as string}
          />
        ) : (
          <FormInput
            type={options.type ?? 'text'}
            label={t(`${name}.label`)}
            placeholder={options.placeholder}
            value={value ?? ''}
            onChange={onChange}
            onBlur={onBlur}
            errorMessage={errors[name]?.message as string}
          />
        )
      }
    />
  );

  return (
    <>
      {field('name')}
      {field('taxId', { placeholder: 'RO12345678' })}
      {field('email', { type: 'email' })}
      {field('phone', { type: 'tel' })}
      {field('address')}
      {field('activityArea')}
      {field('website', { type: 'url', placeholder: 'https://' })}
      {field('description', { textarea: true })}
    </>
  );
};

interface OrganizationFilesProps {
  onLogo: (file: File) => void;
  onStatute: (file: File) => void;
  statuteError?: string;
  logoError?: string;
  statuteLabel?: string;
  logoLabel?: string;
}

export const OrganizationFiles = ({
  onLogo,
  onStatute,
  statuteError,
  logoError,
  statuteLabel,
  logoLabel,
}: OrganizationFilesProps) => (
  <>
    <FileUpload
      type="image"
      label={logoLabel ?? t('logo.label')}
      hint={t('logo.hint')}
      maxSize={LOGO_MAX_BYTES}
      onChange={onLogo}
      errorMessage={logoError}
      rejectedMessage={t('logo.rejected')}
    />
    <FileUpload
      type="pdf"
      label={statuteLabel ?? t('statute.label')}
      hint={t('statute.hint')}
      maxSize={STATUTE_MAX_BYTES}
      onChange={onStatute}
      errorMessage={statuteError}
      rejectedMessage={t('statute.rejected')}
    />
  </>
);
