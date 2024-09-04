import React from 'react';
import FormInput from '../FormInput';
import { useTranslation } from 'react-i18next';
import { OrganizationDataForm } from './OrganizationDataForm';
import { Controller, useForm } from 'react-hook-form';

export const OrganizationDetails = () => {
  const { t } = useTranslation('doc_templates');
  const { control } = useForm();

  return (
    <div className="flex-1 bg-gray-100/40 rounded p-4 flex flex-col gap-5 text-cool-gray-600 self-baseline">
      {/* //TODO: functionality to save the contract template name */}
      <Controller
        name="templateName"
        control={control}
        rules={{ required: true }}
        render={({ field: { value, onChange } }) => (
          <FormInput label={t('template_name')} value={value} onChange={onChange} />
        )}
      />

      <p className="font-robotoBold">{t('organization.data')}</p>
      <p>
        {t('organization.description')} ({/* //TODO: href */}
        <a className="font-roboto text-yellow hover:text-yellow-600 hover:underline underline-offset-2">
          {t('organization.view_profile')}
        </a>
        ). {t('organization.edit')}
      </p>

      <OrganizationDataForm />

      <div className="flex flex-col gap-2">
        <p className="font-robotoBold">{t('organization.volunteer_data.title')}</p>
        <p>{t('organization.volunteer_data.description')}</p>
      </div>

      <div className="flex flex-col gap-2">
        <p className="font-robotoBold">{t('organization.legal_representative_data.title')}</p>
        <p>{t('organization.legal_representative_data.description')}</p>
      </div>
    </div>
  );
};