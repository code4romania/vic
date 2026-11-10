import React from 'react';

import i18n from '../common/config/i18n';
import { RequestStatus } from '../common/enums/request-status.enum';
import PageHeader from '../components/PageHeader';
import { SelectItem } from '../components/Select';
import Tabs from '../components/Tabs';
import PageLayout from '../layouts/PageLayout';
import {
  useApprovedAccessRequestsQuery,
  useNewAccessRequestsQuery,
  useRejectedAccessRequestsQuery,
} from '../services/access-requests/access-requests.service';
import { AccessRequestsProps } from '../containers/query/AccessRequestsWithQueryParams';
import AccessRequestTableWithQueryParams from '../containers/query/AccessRequestTableWithQueryParams';

const AccessRequestsTabs: SelectItem<RequestStatus>[] = [
  { key: RequestStatus.PENDING, value: i18n.t('access_requests:tabs.requests') },
  { key: RequestStatus.APPROVED, value: i18n.t('access_requests:tabs.approved_requests') },
  { key: RequestStatus.REJECTED, value: i18n.t('access_requests:tabs.rejected_requests') },
];

const AccessRequests = ({
  query,
  setQuery,
  embedded,
}: AccessRequestsProps & { embedded?: boolean }) => {
  const onTabClick = (tab: RequestStatus) => {
    // reset filter queries on tab click
    setQuery({ requestStatus: tab }, 'push');
  };

  const content = (
    <Tabs<RequestStatus>
      variant="pills"
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
      {query?.requestStatus === RequestStatus.APPROVED && (
        <AccessRequestTableWithQueryParams
          useAccessRequests={useApprovedAccessRequestsQuery}
          status={RequestStatus.APPROVED}
        />
      )}
      {query?.requestStatus === RequestStatus.REJECTED && (
        <AccessRequestTableWithQueryParams
          useAccessRequests={useRejectedAccessRequestsQuery}
          status={RequestStatus.REJECTED}
        />
      )}
    </Tabs>
  );

  // #499: shown inside the approvals page
  if (embedded) return content;

  return (
    <PageLayout>
      <PageHeader>{i18n.t('side_menu:options.access_requests')}</PageHeader>
      {content}
    </PageLayout>
  );
};

export default AccessRequests;
