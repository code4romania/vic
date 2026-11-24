import React from 'react';
import { Control, Controller, FieldErrors, FieldValues, Path } from 'react-hook-form';
import * as yup from 'yup';
import i18n from '../common/config/i18n';
import FormInput from './FormInput';
import FormTextarea from './FormTextarea';
import FileUpload from './FileUpload';
import { IOrganizationFields } from '../common/interfaces/organization.interface';
import { isValidCui, normalizeCui } from '../common/utils/cui';

export const LOGO_MAX_BYTES = 5 * 1024 * 1024;

const t = (key: string, options?: Record<string, unknown>) =>
  i18n.t(`register_organization:form.${key}`, options) as string;

// Schema messages as functions: yup calls them when a field fails, so the text is in the language of
// that moment, not of the moment this file was loaded.
const m = (key: string, options?: Record<string, unknown>) => () => t(key, options);

const optionalText = () => yup.string().ensure().trim();

const taxIdSchema = (initialTaxId?: string | null) =>
  yup
    .string()
    .trim()
    .required(m('required'))
    .test(
      'cui',
      m('tax_id_invalid'),
      (value) =>
        !value ||
        (initialTaxId != null && normalizeCui(value) === normalizeCui(initialTaxId)) ||
        isValidCui(value),
    );

// The same rules as backend/src/api/organization/dto/organization-fields.ts. #469: registration asks only
// for name, CUI, email and phone; description, address and website are optional and filled in later.
export const organizationFieldsSchema = {
  name: yup
    .string()
    .trim()
    .required(m('required'))
    .min(2, m('min', { value: 2 }))
    .max(100, m('max', { value: 100 })),
  email: yup.string().trim().required(m('required')).email(m('email_invalid')),
  phone: yup
    .string()
    .trim()
    .required(m('required'))
    .max(20, m('max', { value: 20 })),
  taxId: taxIdSchema(),
};

// The profile fields an admin fills in later from the Organization page.
export const organizationProfileSchema = (initialTaxId?: string | null) => ({
  ...organizationFieldsSchema,
  taxId: taxIdSchema(initialTaxId),
  address: optionalText().test(
    'length',
    m('min', { value: 2 }),
    (value) => !value || (value.length >= 2 && value.length <= 500),
  ),
  website: optionalText()
    .max(300, m('max', { value: 300 }))
    .test('url', m('website_invalid'), (value) => !value || /^https?:\/\/\S+\.\S+/.test(value)),
  description: optionalText().test(
    'length',
    m('description.length'),
    (value) => !value || (value.length >= 50 && value.length <= 250),
  ),
});

interface OrganizationFieldsProps<T extends FieldValues & IOrganizationFields> {
  control: Control<T>;
  errors: FieldErrors<T>;
  // Registration shows only the required fields; the edit form also the optional profile.
  withProfile?: boolean;
}

// Text fields of the organization card (#469).
export const OrganizationFields = <T extends FieldValues & IOrganizationFields>({
  control,
  errors,
  withProfile,
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
      {withProfile && (
        <>
          {field('address')}
          {field('website', { type: 'url', placeholder: 'https://' })}
          {field('description', { textarea: true })}
        </>
      )}
    </>
  );
};

interface OrganizationLogoProps {
  onLogo: (file: File) => void;
  logoError?: string;
  logoLabel?: string;
}

export const OrganizationLogo = ({ onLogo, logoError, logoLabel }: OrganizationLogoProps) => (
  <FileUpload
    type="image"
    label={logoLabel ?? t('logo.label')}
    hint={t('logo.hint')}
    maxSize={LOGO_MAX_BYTES}
    onChange={onLogo}
    errorMessage={logoError}
    rejectedMessage={t('logo.rejected')}
  />
);
