import React from 'react';
import i18n from '../common/config/i18n';
import PageHeader from '../components/PageHeader';
import PageLayout from '../layouts/PageLayout';
import ActionsArchiveWithQueryParams from '../containers/query/ActionsArchiveWithQueryParams';

const ActionsArchive = () => {
  return (
    <PageLayout>
      <PageHeader subtitle={i18n.t('actions_archive:subtitle')}>
        {i18n.t('side_menu:options.actions_archive')}
      </PageHeader>
      <ActionsArchiveWithQueryParams />
    </PageLayout>
  );
};

export default ActionsArchive;
