import React from 'react';
import FormInput from '../FormInput';
import { useTranslation } from 'react-i18next';
import { OrganizationDataForm } from './OrganizationDataForm';
import { Control, Controller, FieldValues } from 'react-hook-form';
import { useResyncOrganizationWithOngHubMutation } from '../../services/organization/organization.service';
import Button from '../Button';
import { useQueryClient } from 'react-query';

export const OrganizationDetails = ({ control, readonly }: { control: Control<FieldValues>, readonly?: boolean }) => {
  const { t } = useTranslation(['doc_templates', 'general']);

  const queryClient = useQueryClient();

  const {
    mutate: resyncOrganizationWithOngHub,
    isLoading: isResyncingOrganizationWithOngHubLoading,
  } = useResyncOrganizationWithOngHubMutation();

  return (
    <div className="flex-1 bg-gray-100/40 rounded p-4 flex flex-col gap-5 text-cool-gray-600 self-baseline">
      {/* //TODO: functionality to save the contract template name */}
      <Controller
        name="templateName"
        control={control}
        rules={{ required: true }}
        render={({ field: { value, onChange }, formState: { errors } }) => {
          return (
            <FormInput
              label={t('template_name')}
              value={value}
              onChange={onChange}
              errorMessage={
                errors.templateName && errors.templateName?.type === 'required'
                  ? t('required', { ns: 'general' })
                  : undefined
              }
              readOnly={readonly}
            />
          );
        }}
      />

      <p className="font-robotoBold">{t('organization.data')}</p>
      <p>
        {t('organization.description')} ({/* //TODO: href */}
        <a className="font-roboto text-yellow hover:text-yellow-600 hover:underline underline-offset-2">
          {t('organization.view_profile')}
        </a>
        ). {t('organization.edit')}
      </p>

      {isResyncingOrganizationWithOngHubLoading ? (
        t('organization.organization_data_form.synced.is_syncing')
      ) : (
        <p>
          {t('organization.organization_data_form.synced.p1') + ' '}
          <Button
            label={t('organization.organization_data_form.synced.p2')}
            className="text-yellow underline text-base"
            onClick={() =>
              resyncOrganizationWithOngHub(undefined, {
                onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: ['organization'] });
                },
              })
            }
          />
          {' ' + t('organization.organization_data_form.synced.p3')}
        </p>
      )}

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
