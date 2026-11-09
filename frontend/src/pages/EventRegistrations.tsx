import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { TableColumn } from 'react-data-table-component';
import { useQueryClient } from 'react-query';
import { StringParam, useQueryParams, withDefault } from 'use-query-params';
import i18n from '../common/config/i18n';
import { EventRegistrationStatus } from '../common/enums/event-registration-status.enum';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { IEventRegistration } from '../common/interfaces/event-registration.interface';
import { formatDate, formatDateWithTime } from '../common/utils/utils';
import CardBody from '../components/CardBody';
import CardHeader from '../components/CardHeader';
import DataTableComponent from '../components/DataTableComponent';
import DataTableFilters from '../components/DataTableFilters';
import PageHeader from '../components/PageHeader';
import Popover from '../components/Popover';
import RejectRegistrationModal from '../components/RejectRegistrationModal';
import { SelectItem } from '../components/Select';
import Tabs from '../components/Tabs';
import { useErrorToast, useSuccessToast } from '../hooks/useToast';
import Card from '../layouts/CardLayout';
import CellLayout from '../layouts/CellLayout';
import PageLayout from '../layouts/PageLayout';
import {
  useDecideEventRegistrationMutation,
  useEventRegistrationsQuery,
} from '../services/event/event.service';

const PAGE_SIZE = 10;

const tabs: SelectItem<EventRegistrationStatus>[] = [
  {
    key: EventRegistrationStatus.PENDING,
    value: i18n.t('events:registrations.tabs.pending'),
  },
  {
    key: EventRegistrationStatus.APPROVED,
    value: i18n.t('events:registrations.tabs.approved'),
  },
  {
    key: EventRegistrationStatus.REJECTED,
    value: i18n.t('events:registrations.tabs.rejected'),
  },
];

const isStatus = (value?: string | null): value is EventRegistrationStatus =>
  Object.values(EventRegistrationStatus).includes(value as EventRegistrationStatus);

const columns = (status: EventRegistrationStatus): TableColumn<IEventRegistration>[] => [
  {
    id: 'user',
    name: i18n.t('events:registrations.header.person'),
    grow: 2,
    minWidth: '12rem',
    cell: (row) => (
      <div className="flex flex-col min-w-0 py-2">
        {row.volunteerId ? (
          <Link className="font-robotoBold truncate" to={`/volunteers/${row.volunteerId}`}>
            {row.user.name}
          </Link>
        ) : (
          <small className="font-robotoBold truncate">{row.user.name}</small>
        )}
        <small className="truncate text-cool-gray-500">{row.user.email}</small>
      </div>
    ),
  },
  {
    id: 'event',
    name: i18n.t('events:registrations.header.event'),
    grow: 2,
    minWidth: '12rem',
    cell: (row) => (
      <div className="flex flex-col min-w-0 py-2">
        <Link className="truncate" to={`/events/${row.event.id}`}>
          {row.event.name}
        </Link>
        <small className="text-cool-gray-500">{formatDateWithTime(row.event.startDate)}</small>
      </div>
    ),
  },
  {
    id: 'volunteerStatus',
    name: i18n.t('events:registrations.header.in_organization'),
    grow: 1,
    minWidth: '9rem',
    selector: (row) =>
      row.volunteerStatus
        ? i18n.t(`events:registrations.volunteer_status.${row.volunteerStatus}`)
        : i18n.t('events:registrations.volunteer_status.none'),
  },
  {
    id: 'createdOn',
    name: i18n.t('events:registrations.header.registered_on'),
    grow: 1,
    minWidth: '8rem',
    selector: (row) => formatDate(row.createdOn),
  },
  ...(status === EventRegistrationStatus.PENDING
    ? []
    : [
        {
          id: 'decided',
          name: i18n.t('events:registrations.header.decided'),
          grow: 2,
          minWidth: '12rem',
          cell: (row: IEventRegistration) => (
            <CellLayout>
              <div className="flex flex-col min-w-0 py-2">
                <small>
                  {[row.decidedByName, row.decidedOn && formatDate(row.decidedOn)]
                    .filter(Boolean)
                    .join(', ') || i18n.t('events:registrations.automatic')}
                </small>
                {row.rejectionReason && (
                  <small className="text-cool-gray-500 whitespace-normal">
                    {row.rejectionReason}
                  </small>
                )}
              </div>
            </CellLayout>
          ),
        },
      ]),
];

// VIC 2.0 (#501): the NGO approves or rejects registrations to its events. Volunteers from the
// event's departments are approved automatically, so the pending tab holds everyone else. A decision
// can be changed from the other tabs; the volunteer is notified each time.
const EventRegistrations = () => {
  const [query, setQuery] = useQueryParams({
    status: withDefault(StringParam, EventRegistrationStatus.PENDING),
    search: StringParam,
  });
  const status = isStatus(query.status) ? query.status : EventRegistrationStatus.PENDING;
  const [page, setPage] = useState<number>(1);
  const [rejecting, setRejecting] = useState<IEventRegistration>();

  const queryClient = useQueryClient();
  const { data, isLoading } = useEventRegistrationsQuery({
    status,
    page,
    limit: PAGE_SIZE,
    search: query.search || undefined,
  });
  const { mutate: decide, isLoading: isDeciding } = useDecideEventRegistrationMutation();

  const onDecide = (row: IEventRegistration, reason?: string) =>
    decide(
      { id: row.id, reason },
      {
        onSuccess: () => {
          useSuccessToast(
            i18n.t(
              reason === undefined
                ? 'events:registrations.approved'
                : 'events:registrations.rejected',
              { name: row.user.name },
            ),
          );
          setRejecting(undefined);
          queryClient.invalidateQueries(['event-registrations']);
          queryClient.invalidateQueries(['rsvp']);
        },
        onError: (error) =>
          useErrorToast(InternalErrors.EVENT_ERRORS.getError(error.response?.data.code_error)),
      },
    );

  const actions = (row: IEventRegistration) => [
    ...(status !== EventRegistrationStatus.APPROVED
      ? [
          {
            label: i18n.t('events:registrations.approve'),
            icon: <CheckIcon className="menu-icon" />,
            onClick: () => onDecide(row),
          },
        ]
      : []),
    ...(status !== EventRegistrationStatus.REJECTED
      ? [
          {
            label: i18n.t('events:registrations.reject.button'),
            icon: <XMarkIcon className="menu-icon" />,
            onClick: () => setRejecting(row),
            alert: true,
          },
        ]
      : []),
  ];

  return (
    <PageLayout>
      <PageHeader>{i18n.t('events:registrations.title')}</PageHeader>
      <p className="text-cool-gray-500">{i18n.t('events:registrations.description')}</p>
      <Tabs<EventRegistrationStatus>
        tabs={tabs}
        onClick={(tab) => {
          setPage(1);
          setQuery({ status: tab }, 'replaceIn');
        }}
        defaultTab={tabs.find((tab) => tab.key === status)}
      >
        <DataTableFilters
          searchValue={query.search}
          searchPlaceholder={`${i18n.t('events:registrations.search')}`}
          onSearch={(search) => {
            setPage(1);
            setQuery({ search: search || undefined }, 'replaceIn');
          }}
          onResetFilters={() => setQuery({ search: undefined }, 'replaceIn')}
        />
        <Card>
          <CardHeader>
            <h2>{tabs.find((tab) => tab.key === status)?.value}</h2>
          </CardHeader>
          <CardBody>
            <DataTableComponent
              columns={[
                ...columns(status),
                {
                  name: '',
                  width: '50px',
                  allowOverflow: true,
                  cell: (row: IEventRegistration) => (
                    <Popover<IEventRegistration> row={row} items={actions(row)} />
                  ),
                },
              ]}
              data={data?.items}
              loading={isLoading || isDeciding}
              pagination
              paginationPerPage={PAGE_SIZE}
              paginationTotalRows={data?.meta?.totalItems}
              paginationDefaultPage={page}
              onChangePage={setPage}
            />
          </CardBody>
        </Card>
      </Tabs>
      {rejecting && (
        <RejectRegistrationModal
          name={rejecting.user.name}
          isLoading={isDeciding}
          onClose={() => setRejecting(undefined)}
          onConfirm={(reason) => onDecide(rejecting, reason)}
        />
      )}
    </PageLayout>
  );
};

export default EventRegistrations;
