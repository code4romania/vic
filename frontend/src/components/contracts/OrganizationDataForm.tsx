import React from 'react';
import FormInput from '../FormInput';
import { useTranslation } from 'react-i18next';
import { useOrganizationQuery } from '../../services/organization/organization.service';
import LoadingContent from '../LoadingContent';
import { OrganizationDataError } from '../OrganizationDataError';

export const OrganizationDataForm = () => {
  const { t } = useTranslation('doc_templates');

  const { data: organization, isLoading, isError, refetch, isFetching } = useOrganizationQuery();

  const handleRefetch = () => {
    refetch();
  };

  if (isLoading) return <LoadingContent />;
  if (isError) return <OrganizationDataError onRetry={handleRefetch} isFetching={isFetching} />;

  return (
    <>
      <FormInput
        type="text"
        disabled
        label={t('organization.name')}
        value={organization ? organization.name : ''}
        id="organization_name"
        errorMessage={
          organization && !organization.name
            ? t('organization.organization_data_form.missing_name')
            : undefined
        }
      />
      <FormInput
        type="text"
        disabled
        label={t('organization.address')}
        value={organization?.address || ''}
        id="organization_address"
        errorMessage={
          organization && !organization.address
            ? t('organization.organization_data_form.missing_address')
            : undefined
        }
      />
      <FormInput
        type="text"
        disabled
        label={t('organization.cui')}
        value={organization?.cui || ''}
        id="organization_CUI"
        errorMessage={
          organization && !organization.cui
            ? t('organization.organization_data_form.missing_cui')
            : undefined
        }
      />
      <FormInput
        type="text"
        disabled
        label={t('organization.legal_representative')}
        value={organization?.legalReprezentativeFullName || ''}
        id="organization_legal_representative"
        errorMessage={
          organization && !organization.legalReprezentativeFullName
            ? t('organization.organization_data_form.missing_legalReprezentativeFullName')
            : undefined
        }
      />
      <FormInput
        type="text"
        disabled
        label={t('organization.legal_representative_role')}
        value={organization?.legalReprezentativeRole || ''}
        id="organization_legal_representative_role"
        errorMessage={
          organization && !organization.legalReprezentativeRole
            ? t('organization.organization_data_form.missing_legalReprezentativeRole')
            : undefined
        }
      />
    </>
  );
};
