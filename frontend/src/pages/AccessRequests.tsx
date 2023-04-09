import React from 'react';

import i18n from '../common/config/i18n';
import { RequestStatus } from '../common/enums/request-status.enum';
import PageHeader from '../components/PageHeader';
import { SelectItem } from '../components/Select';
import Tabs from '../components/Tabs';
import PageLayout from '../layouts/PageLayout';
import {
  useNewAccessRequestsQuery,
  useRejectedAccessRequestsQuery,
} from '../services/access-requests/access-requests.service';
import { AccessRequestsProps } from '../containers/query/AccessRequestsWithQueryParams';
import AccessRequestTableWithQueryParams from '../containers/query/AccessRequestTableWithQueryParams';

const AccessRequestsTabs: SelectItem<RequestStatus>[] = [
  { key: RequestStatus.PENDING, value: i18n.t('access_requests:tabs.requests') },
  { key: RequestStatus.REJECTED, value: i18n.t('access_requests:tabs.rejected_requests') },
];

const AccessRequests = ({ query, setQuery }: AccessRequestsProps) => {
  const onTabClick = (tab: RequestStatus) => {
    // reset filter queries on tab click
    setQuery({ requestStatus: tab }, 'push');
  };

  return (
    <PageLayout>
      <PageHeader>{i18n.t('side_menu:options.access_requests')}</PageHeader>
      <Tabs<RequestStatus>
        tabs={AccessRequestsTabs}
        onClick={onTabClick}
        defaultTab={AccessRequestsTabs.find((tab) => tab.key === query?.requestStatus)}
      >
        {query?.requestStatus === RequestStatus.PENDING && (
          <AccessRequestTableWithQueryParams
            useAccessRequests={useNewAccessRequestsQuery}
            status={RequestStatus.PENDING}
          />
        )}
        {query?.requestStatus === RequestStatus.REJECTED && (
          <AccessRequestTableWithQueryParams
            useAccessRequests={useRejectedAccessRequestsQuery}
            status={RequestStatus.REJECTED}
          />
        )}
      </Tabs>
    </PageLayout>
  );
};

export default AccessRequests;
