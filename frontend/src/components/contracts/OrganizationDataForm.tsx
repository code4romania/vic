import React from 'react';
import FormInput from '../FormInput';
import { useTranslation } from 'react-i18next';
import { useOrganizationQuery } from '../../services/organization/organization.service';

export const OrganizationDataForm = () => {
  const { t } = useTranslation('doc_templates');

  const { data: organization } = useOrganizationQuery();

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
