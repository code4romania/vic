import React from 'react';
import { useTranslation } from 'react-i18next';
import PageHeader from '../components/PageHeader';
import ContractsTableWithQueryParams from '../containers/query/ContractsTableWithQueryParams';
import PageLayout from '../layouts/PageLayout';

// VIC 2.0, #486/#489: every contract the NGO uploaded, filtered by status. No templates, no generation.
const Contracts = () => {
  const { t } = useTranslation('documents');

  return (
    <PageLayout>
      <PageHeader>{t('title')}</PageHeader>
      <p className="text-cool-gray-500">{t('description')}</p>
      <ContractsTableWithQueryParams />
    </PageLayout>
  );
};

export default Contracts;
