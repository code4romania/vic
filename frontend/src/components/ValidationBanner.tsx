import React from 'react';
import { useTranslation } from 'react-i18next';
import { useOrganizationQuery } from '../services/organization/organization.service';

// On every private page while the organization waits for a super admin's validation (decision 1).
const ValidationBanner = () => {
  const { t } = useTranslation('organization');
  const { data: organization } = useOrganizationQuery();

  if (!organization || organization.validatedAt) return null;

  return (
    <div role="status" className="rounded-lg bg-yellow-50 border border-yellow-300 p-4 text-sm">
      {t('validation_banner')}
    </div>
  );
};

export default ValidationBanner;
