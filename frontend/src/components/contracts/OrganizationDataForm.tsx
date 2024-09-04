import React from 'react';
import FormInput from '../FormInput';
import { useTranslation } from 'react-i18next';
import { useOrganizationQuery } from '../../services/organization/organization.service';
import LoadingContent from '../LoadingContent';
import { OrganizationDataError } from '../OrganizationDataError';

export const OrganizationDataForm = () => {
  const { t } = useTranslation('doc_templates');

  const { data: organization, isLoading, isError, refetch } = useOrganizationQuery();

  const handleRefetch = () => {
    refetch();
  };

  if (isLoading) return <LoadingContent />;
  if (isError) return <OrganizationDataError onRetry={handleRefetch} />;

  return (
    <>
      <FormInput
        type="text"
        disabled
        label={t('organization.name')}
        value={organization ? organization.name : t('organization_name')}
        id="organization_name"
      />
      <FormInput
        type="text"
        disabled
        label={t('organization.address')}
        value={organization?.address || ''}
        id="organization_address"
      />
      <FormInput
        type="text"
        disabled
        label={t('organization.cui')}
        value={organization?.cui || ''}
        id="organization_CUI"
      />
      <FormInput
        type="text"
        disabled
        label={t('organization.legal_representative')}
        value={organization?.legalRepresentative || ''}
        id="organization_legal_representative"
      />
      <FormInput
        type="text"
        disabled
        label={t('organization.legal_representative_role')}
        value={organization?.legalRepresentativeRole || ''}
        id="organization_legal_representative_role"
      />
    </>
  );
};
