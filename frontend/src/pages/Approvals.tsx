import React, { useEffect } from 'react';
import { useIsMutating } from 'react-query';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { StringParam, useQueryParams, withDefault } from 'use-query-params';
import i18n from '../common/config/i18n';
import { ActivityLogResolutionStatus } from '../common/enums/activity-log-resolution-status.enum';
import { ActivityLogStatus } from '../common/enums/activity-log.status.enum';
import PageHeader from '../components/PageHeader';
import { SelectItem } from '../components/Select';
import Tabs, { TabItem } from '../components/Tabs';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import AccessRequestsWithQueryParams from '../containers/query/AccessRequestsWithQueryParams';
import ActivityLogTableWithQueryParams from '../containers/query/ActivityLogTableWithQueryParams';
import PageLayout from '../layouts/PageLayout';
import { IPendingApprovals } from '../services/approvals/approvals.api';
import { usePendingApprovalsQuery } from '../services/approvals/approvals.service';
import EventRegistrations from './EventRegistrations';

export enum ApprovalType {
  VOLUNTEERS = 'volunteers',
  HOURS = 'hours',
  EVENTS = 'events',
}

const COUNTER: Record<ApprovalType, keyof IPendingApprovals> = {
  [ApprovalType.VOLUNTEERS]: 'accessRequests',
  [ApprovalType.HOURS]: 'activityLogs',
  [ApprovalType.EVENTS]: 'eventRegistrations',
};

type HoursTab = 'pending' | ActivityLogStatus.APPROVED | ActivityLogStatus.REJECTED;

const HOURS_TABS: SelectItem<HoursTab>[] = [
  { key: 'pending', value: i18n.t('approvals:status.pending') },
  { key: ActivityLogStatus.APPROVED, value: i18n.t('approvals:status.approved') },
  { key: ActivityLogStatus.REJECTED, value: i18n.t('approvals:status.rejected') },
];

// Hours requests: Pending / Approved / Rejected on top of the activity log table
const HoursApprovals = () => {
  const [query, setQuery] = useQueryParams({ hours: withDefault(StringParam, 'pending') });
  const tab = (HOURS_TABS.find((item) => item.key === query.hours) ?? HOURS_TABS[0]).key;

  return (
    <Tabs<HoursTab>
      variant="pills"
      tabs={HOURS_TABS}
      onClick={(hours) => setQuery({ hours }, 'push')}
      defaultTab={HOURS_TABS.find((item) => item.key === tab)}
    >
      {tab === 'pending' ? (
        <ActivityLogTableWithQueryParams
          key="pending"
          resolutionStatus={ActivityLogResolutionStatus.NEW}
        />
      ) : (
        <ActivityLogTableWithQueryParams
          key={tab}
          resolutionStatus={ActivityLogResolutionStatus.SOLVED}
          fixedStatus={tab}
        />
      )}
    </Tabs>
  );
};

// #499: one page for everything the NGO approves: volunteer applications, hours and event
// registrations, each with Pending / Approved / Rejected, and the pending counters on the tabs.
// Each count shows once (audit, major 11): per type on its tab, the sum in the header; the
// counter cards that repeated the tabs are gone.
const Approvals = () => {
  const navigate = useNavigate();
  const { type } = useParams();
  const { data: pending, refetch } = usePendingApprovalsQuery();

  // a decision on any tab changes the counters
  const mutating = useIsMutating();
  useEffect(() => {
    if (mutating === 0) refetch();
  }, [mutating]);

  if (!Object.values(ApprovalType).includes(type as ApprovalType)) {
    return <Navigate to={`/approvals/${ApprovalType.VOLUNTEERS}`} replace />;
  }

  const tabs: TabItem<ApprovalType>[] = Object.values(ApprovalType).map((key) => ({
    key,
    value: `${i18n.t(`approvals:tabs.${key}`)}`,
    count: pending?.[COUNTER[key]],
  }));

  return (
    <PageLayout>
      <PageHeader
        subtitle={`${i18n.t('approvals:description')}`}
        actions={
          !!pending?.total && (
            <span className="flex items-center gap-2 rounded-lg bg-figure-red px-4 py-2 text-white font-robotoMedium">
              <ExclamationCircleIcon className="w-5 h-5" aria-hidden="true" />
              {i18n.t('approvals:pending_total', { count: pending.total })}
            </span>
          )
        }
      >
        {i18n.t('approvals:title')}
      </PageHeader>
      <Tabs<ApprovalType>
        tabs={tabs}
        // switching type starts from that type's pending requests, with no filters
        onClick={(key) => navigate(`/approvals/${key}`)}
        defaultTab={tabs.find((tab) => tab.key === type)}
      >
        {type === ApprovalType.VOLUNTEERS && <AccessRequestsWithQueryParams embedded />}
        {type === ApprovalType.HOURS && <HoursApprovals />}
        {type === ApprovalType.EVENTS && <EventRegistrations embedded />}
      </Tabs>
    </PageLayout>
  );
};

export default Approvals;
