import React, { useState } from 'react';
import { useContractTemplateQuery } from '../services/documents-templates/documents-templates.service';
import PageLayout from '../layouts/PageLayout';
import PageHeader from '../components/PageHeader';
import { useTranslation } from 'react-i18next';
import Tabs from '../components/Tabs';
import { ContractType } from '../common/enums/contract-type.enum';
import { ContractsStatistics } from '../components/ContractsStatistics';
import NewContractsTableWithQueryParams from '../containers/query/NewContractsTableWithQueryParams';
import { DocumentTemplatesTableWithQueryParams } from '../containers/query/DocumentTemplatesTableWithQueryParams';

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

const templates: ContractTemplate[] = [
  {
    id: '9a827436-e0b8-4763-8b04-ccff3f9b2757',
    name: 'Test Template Lucia',
    organizationData: {
      CUI: '1278133',
      officialName: 'Tenebru Diamonds Industry',
      registeredOffice: 'Strada Cazarmii NR. 3392',
      legalRepresentativeName: 'John Dave',
      legalRepresentativeRole: 'Admin',
    },
    documentTerms: '<p>Contract terms</p>',
    createdByAdmin: {
      id: '8f2a561d-982f-465f-8dfb-bb2e16c39be6',
      name: 'Galdo Gerald',
    },
  },
  {
    id: 'b3c45678-d9e0-4f12-a3b4-56c7d8e9f012',
    name: 'Standard Contract Template',
    organizationData: {
      CUI: '9876543',
      officialName: 'Global Solutions Inc.',
      registeredOffice: 'Main Street 123',
      legalRepresentativeName: 'Jane Smith',
      legalRepresentativeRole: 'CEO',
    },
    documentTerms: '<p>Standard contract terms and conditions</p>',
    createdByAdmin: {
      id: '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p',
      name: 'Admin User',
    },
  },
  {
    id: 'c7d89012-e3f4-5g6h-i7j8-9k0l1m2n3o4p',
    name: 'Volunteer Agreement Template',
    organizationData: {
      CUI: '5432109',
      officialName: 'Community Helpers Association',
      registeredOffice: 'Volunteer Avenue 456',
      legalRepresentativeName: 'Mark Johnson',
      legalRepresentativeRole: 'Director',
    },
    documentTerms: '<p>Volunteer agreement terms</p>',
    createdByAdmin: {
      id: 'q1w2e3r4-t5y6-u7i8-o9p0-a1s2d3f4g5h6',
      name: 'Sarah Admin',
    },
  },
];

export const DocumentContracts = () => {
  const { t } = useTranslation('volunteering_contracts');
  const { data: contractTemplate } = useContractTemplateQuery(templates[0].id);
  console.log(contractTemplate);
  // todo: probably modify this to use query params
  const [activeTab, setActiveTab] = useState<ContractType>(ContractType.CONTRACT);

  // todo:
  // get all contract templates
  // loading state
  // error state

  const onTabClick = (tab: ContractType) => {
    setActiveTab(tab);
  };

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
        // defaultTab={DocumentsTabsOptions.find((tab) => tab.key === query?.contractType)}
        >
          <p className="text-cool-gray-500">{t('description')}</p>

          {activeTab === ContractType.TEMPLATE ? (
            <DocumentTemplatesTableWithQueryParams />
          ) : (
            <>
              <ContractsStatistics />
              {/* //! THIS USES THE OLD COMPONENT, IT'S JUST A COPY OF THAT */}
              <NewContractsTableWithQueryParams />
            </>
          )}
        </Tabs>
      </PageLayout>
    </>
  );
};
