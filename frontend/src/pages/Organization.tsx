import React, { useEffect, useState } from 'react';
import OrganizationProfile from '../components/OrganizationProfile';
import { useErrorToast } from '../hooks/useToast';
import PageLayout from '../layouts/PageLayout';
import { useOrganizationQuery } from '../services/organization/organization.service';
import { InternalErrors } from '../common/errors/internal-errors.class';
import i18n from '../common/config/i18n';
import EmptyContent from '../components/EmptyContent';
import LoadingContent from '../components/LoadingContent';
import PageHeader from '../components/PageHeader';
import { DivisionType } from '../common/enums/division-type.enum';
import Tabs from '../components/Tabs';
import DivisionTable from '../components/DivisionTable';
import { SelectItem } from '../components/Select';

export const DivisionsTabs: SelectItem<DivisionType>[] = [
  { key: DivisionType.BRANCH, value: i18n.t(`division:table.title.branch`) },
  { key: DivisionType.DEPARTMENT, value: i18n.t('division:table.title.department') },
  { key: DivisionType.ROLE, value: i18n.t('division:table.title.role') },
];

const Organization = () => {
  const [divisionType, setDivisionType] = useState<DivisionType>(DivisionType.BRANCH);

  const {
    data: organization,
    error: organizationError,
    isLoading: isOrganizationLoading,
  } = useOrganizationQuery();

  // error handling
  useEffect(() => {
    // map error messages for ORGANIZATION fetch
    if (organizationError) {
      useErrorToast(
        InternalErrors.ORGANIZATION_ERRORS.getError(organizationError.response?.data.code_error),
        'organization_error',
      );
    }
  }, [organizationError]);

  const onTabClick = (id: DivisionType) => {
    setDivisionType(DivisionsTabs.find((tab) => tab.key === id)?.key as DivisionType);
  };

  return (
    <PageLayout>
      <PageHeader>{i18n.t('side_menu:options.organization')}</PageHeader>
      {organization && <OrganizationProfile organization={organization} />}
      {organizationError && (
        <EmptyContent
          description={InternalErrors.ORGANIZATION_ERRORS.getError(
            organizationError.response?.data.code_error,
          )}
        />
      )}
      {isOrganizationLoading && <LoadingContent />}
      <Tabs<DivisionType> tabs={DivisionsTabs} onClick={onTabClick}>
        {divisionType === DivisionType.BRANCH && <DivisionTable type={DivisionType.BRANCH} />}
        {divisionType === DivisionType.DEPARTMENT && (
          <DivisionTable type={DivisionType.DEPARTMENT} />
        )}
        {divisionType === DivisionType.ROLE && <DivisionTable type={DivisionType.ROLE} />}
      </Tabs>
      ;
    </PageLayout>
  );
};

export default Organization;
