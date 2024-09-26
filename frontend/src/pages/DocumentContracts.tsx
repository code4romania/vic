import React, { useEffect, useState } from 'react';
import PageLayout from '../layouts/PageLayout';
import PageHeader from '../components/PageHeader';
import { useTranslation } from 'react-i18next';
import Tabs from '../components/Tabs';
import { ContractType } from '../common/enums/contract-type.enum';
// import { ContractsStatistics } from '../components/ContractsStatistics';
// import NewContractsTableWithQueryParams from '../containers/query/DocumentContractsTableWithQueryParams';
// import { DocumentTemplatesTableWithQueryParams } from '../containers/query/DocumentTemplatesTableWithQueryParams';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { SelectItem } from '../components/Select';

interface OrganizationData {
  CUI: string;
  officialName: string;
  registeredOffice: string;
  legalRepresentativeName: string;
  legalRepresentativeRole: string;
}

interface CreatedByAdmin {
  id: string;
  name: string;
}

export interface ContractTemplate {
  id: string;
  name: string;
  organizationData: OrganizationData;
  documentTerms: string;
  createdByAdmin: CreatedByAdmin;
}

export const DocumentContracts = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { t } = useTranslation('volunteering_contracts');
  const onTabClick = (tab: ContractType) => {
    navigate(`/documents/${tab}`);
  };
  const [activeTab, setActiveTab] = useState<SelectItem<ContractType>>({
    key: ContractType.CONTRACT,
    value: t('tabs.contracts'),
  });

  useEffect(() => {
    if (pathname.includes(ContractType.CONTRACT)) {
      setActiveTab({ key: ContractType.CONTRACT, value: t('tabs.contracts') });
    } else if (pathname.includes(ContractType.TEMPLATE)) {
      setActiveTab({ key: ContractType.TEMPLATE, value: t('tabs.templates') });
    }
  }, [pathname]);

  return (
    <>
      <PageLayout>
        <PageHeader>{t('title')}</PageHeader>
        <Tabs<ContractType>
          tabs={[
            { key: ContractType.CONTRACT, value: t('tabs.contracts') },
            { key: ContractType.TEMPLATE, value: t('tabs.templates') },
          ]}
          onClick={onTabClick}
          defaultTab={activeTab}
          selectClassName="max-w-[37rem]"
        >
          <p className="text-cool-gray-500">{t('description')}</p>
          <Outlet />
        </Tabs>
      </PageLayout>
    </>
  );
};
