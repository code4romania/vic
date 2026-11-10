import React, { useEffect, useState } from 'react';
import { useQueryClient } from 'react-query';
import {
  ArrowDownTrayIcon,
  CloudArrowUpIcon,
  DocumentMinusIcon,
  EyeIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { SortOrder, TableColumn } from 'react-data-table-component';
import i18n from '../common/config/i18n';
import { OrderDirection } from '../common/enums/order-direction.enum';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { IEvent } from '../common/interfaces/event.interface';
import Button from '../components/Button';
import CardBody from '../components/CardBody';
import DataTableComponent from '../components/DataTableComponent';
import Popover from '../components/Popover';
import { SelectItem } from '../components/Select';
import Tabs from '../components/Tabs';
import { useErrorToast, useSuccessToast } from '../hooks/useToast';
import { useValidationGate } from '../hooks/useValidationGate';
import Card from '../layouts/CardLayout';
import PageLayout from '../layouts/PageLayout';
import { EventState } from '../common/enums/event-state.enum';
import {
  useArchiveEventMutation,
  useDeleteEventMutation,
  useEventsQuery,
  useEventCountersQuery,
  usePublishEventMutation,
} from '../services/event/event.service';
import { downloadExcel } from '../common/utils/utils';
import PageHeader from '../components/PageHeader';
import DataTableFilters from '../components/DataTableFilters';
import {
  EventLocation,
  EventParticipants,
  EventPendingBadge,
  EventPeriod,
  EventStatusBadge,
  EventTargets,
} from '../components/EventCells';
import { useNavigate } from 'react-router-dom';
import { EventStatus } from '../common/enums/event-status';
import ConfirmationModal from '../components/ConfirmationModal';
import { getEventsForDownload } from '../services/event/event.api';
import { EventsProps } from '../containers/query/EventsWithQueryParams';
import SelectFilter from '../containers/SelectFilter';
import StatisticsCard from '../components/StatisticsCard';
import { useDivisionsListItems } from '../services/division/division.service';
import { DivisionType } from '../common/enums/division-type.enum';

// VIC 2.0 (#495): upcoming (not started), ongoing (started, not ended) and finished, each paginated
const EventsTabsOptions: SelectItem<EventState>[] = [
  { key: EventState.UPCOMING, value: i18n.t('events:tabs.upcoming') },
  { key: EventState.ONGOING, value: i18n.t('events:tabs.ongoing') },
  { key: EventState.PAST, value: i18n.t('events:tabs.past') },
];

const currentTab = (state?: string): SelectItem<EventState> =>
  EventsTabsOptions.find((tab) => tab.key === state) ?? EventsTabsOptions[0];

const nameColumn: TableColumn<IEvent> = {
  id: 'name',
  name: i18n.t('events:table.event'),
  sortable: true,
  minWidth: '10rem',
  grow: 2,
  cell: (row: IEvent) => (
    <span className="text-sm font-robotoMedium text-cool-gray-900">{row.name}</span>
  ),
};

const periodColumn: TableColumn<IEvent> = {
  id: 'startDate',
  name: i18n.t('events:table.period'),
  minWidth: '13rem',
  grow: 1,
  sortable: true,
  cell: (row: IEvent) => <EventPeriod event={row} />,
};

const locationColumn: TableColumn<IEvent> = {
  id: 'location',
  name: i18n.t('events:table.location'),
  minWidth: '10rem',
  grow: 1,
  cell: (row: IEvent) => <EventLocation location={row.location} />,
};

const departmentsColumn: TableColumn<IEvent> = {
  id: 'target',
  name: i18n.t('events:table.departments'),
  minWidth: '9rem',
  grow: 1,
  cell: (row: IEvent) => <EventTargets event={row} />,
};

const participantsColumn: TableColumn<IEvent> = {
  id: 'going',
  name: i18n.t('events:table.participants'),
  minWidth: '8rem',
  grow: 1,
  cell: (row: IEvent) => (
    <EventParticipants going={row.going} capacity={row.capacity} notGoing={row.notGoing} />
  ),
};

// finished events: the hours the volunteers logged for them
const hoursColumn: TableColumn<IEvent> = {
  id: 'hours',
  name: i18n.t('events:table.hours'),
  minWidth: '7rem',
  grow: 0,
  cell: (row: IEvent) => (
    <div className="flex flex-col">
      <span className="text-sm font-robotoMedium text-navy">
        {i18n.t('events:table.hours_value', { hours: row.activityLogged?.totalHours ?? 0 })}
      </span>
      <span className="text-xs text-cool-gray-500">
        {i18n.t('events:table.hours_people', { count: row.activityLogged?.volunteers ?? 0 })}
      </span>
    </div>
  ),
};

const statusColumn: TableColumn<IEvent> = {
  id: 'status',
  name: i18n.t('events:table.status'),
  minWidth: '8rem',
  grow: 0,
  sortable: true,
  cell: (row: IEvent) => (
    <div className="flex flex-col items-start gap-1">
      <EventStatusBadge event={row} />
      <EventPendingBadge eventId={row.id} />
    </div>
  ),
};

const Events = ({ query, setQuery }: EventsProps) => {
  const { gate } = useValidationGate();
  const [showDeleteEvent, setShowDeleteEvent] = useState<null | IEvent>();

  const navigate = useNavigate();

  const queryClient = useQueryClient();
  const search = query.search || undefined;
  const {
    data: events,
    isLoading: isEventsLoading,
    error: eventsError,
  } = useEventsQuery(
    query.limit as number,
    query.page as number,
    query.eventState as EventState,
    query.orderBy,
    query.orderDirection as OrderDirection,
    query.departmentId,
    search,
  );
  // the count on each tab, with the same filters (one row is enough to get the total)
  const tabTotals = {
    [EventState.UPCOMING]: useEventsQuery(
      1,
      1,
      EventState.UPCOMING,
      undefined,
      undefined,
      query.departmentId,
      search,
    ).data?.meta?.totalItems,
    [EventState.ONGOING]: useEventsQuery(
      1,
      1,
      EventState.ONGOING,
      undefined,
      undefined,
      query.departmentId,
      search,
    ).data?.meta?.totalItems,
    [EventState.PAST]: useEventsQuery(
      1,
      1,
      EventState.PAST,
      undefined,
      undefined,
      query.departmentId,
      search,
    ).data?.meta?.totalItems,
  } as Partial<Record<EventState, number>>;
  // as in the design: "Viitoare (3)"; the shared count badge is red, meant for things to approve
  const tabs: SelectItem<EventState>[] = EventsTabsOptions.map((tab) => ({
    ...tab,
    value: tabTotals[tab.key] === undefined ? tab.value : `${tab.value} (${tabTotals[tab.key]})`,
  }));
  const refetch = () => {
    queryClient.invalidateQueries(['events']);
    queryClient.invalidateQueries(['event-counters']);
  };
  const { data: departments } = useDivisionsListItems(DivisionType.DEPARTMENT);
  const { data: counters } = useEventCountersQuery(query.departmentId);
  // actions
  const { mutateAsync: archiveEvent, isLoading: isArchivingEvent } = useArchiveEventMutation();
  const { mutateAsync: publishEvent, isLoading: isPublishingEvent } = usePublishEventMutation();
  const { mutateAsync: deleteEvent, isLoading: isDeletingEvent } = useDeleteEventMutation();

  useEffect(() => {
    if (eventsError)
      useErrorToast(InternalErrors.EVENT_ERRORS.getError(eventsError.response?.data.code_error));
  }, [eventsError]);

  const onTabClick = (tab: EventState) => {
    // reset filter queries on tab click
    setQuery({ eventState: tab, page: 1 }, 'replaceIn');
  };

  // #494: "all departments" clears the filter
  const onDepartmentChange = (item?: SelectItem<string>) => {
    setQuery({ departmentId: item?.key, page: 1 }, 'replaceIn');
  };

  const onSearch = (value: string) => {
    setQuery({ search: value || undefined, page: 1 }, 'replaceIn');
  };

  const onResetFilters = () => {
    setQuery({ departmentId: undefined, search: undefined, page: 1 }, 'replaceIn');
  };

  // row actions
  const onView = (row: IEvent) => {
    navigate(`${row.id}`);
  };

  const onPublish = (row: IEvent) => {
    publishEvent(row.id, {
      onSuccess: () => {
        useSuccessToast(`${i18n.t('events:form.submit.published')}`);
        refetch();
      },
      onError: (error) => {
        useErrorToast(InternalErrors.EVENT_ERRORS.getError(error.response?.data.code_error));
      },
    });
  };

  const onArchive = (row: IEvent) => {
    archiveEvent(row.id, {
      onSuccess: () => {
        useSuccessToast(`${i18n.t('events:form.submit.archived')}`);
        refetch();
      },
      onError: (error) => {
        useErrorToast(InternalErrors.EVENT_ERRORS.getError(error.response?.data.code_error));
      },
    });
  };

  const onEdit = (row: IEvent) => {
    navigate(`${row.id}/edit`);
  };

  const onDelete = (row: IEvent) => {
    setShowDeleteEvent(row);
  };

  const confirmDelete = () => {
    if (showDeleteEvent)
      deleteEvent(showDeleteEvent.id, {
        onSuccess: () => {
          useSuccessToast(`${i18n.t('events:modal.delete')}`);
          refetch();
        },
        onError: (error) => {
          useErrorToast(InternalErrors.EVENT_ERRORS.getError(error.response?.data.code_error));
        },
        onSettled: () => {
          setShowDeleteEvent(null);
        },
      });
  };

  // menu items
  const buildEventsActionColumn = (): TableColumn<IEvent> => {
    const EventsArchiveActionColumns = [
      {
        label: i18n.t('events:popover.view'),
        icon: <EyeIcon className="menu-icon" />,
        onClick: onView,
      },
      {
        label: i18n.t('general:edit', { item: '' }),
        icon: <PencilIcon className="menu-icon" />,
        onClick: onEdit,
      },
      {
        label: i18n.t('events:popover.archive'),
        icon: <DocumentMinusIcon className="menu-icon" />,
        onClick: onArchive,
      },
      {
        label: i18n.t('events:popover.delete'),
        icon: <TrashIcon className="menu-icon" />,
        onClick: onDelete,
        alert: true,
      },
    ];

    const EventsPublishActionColumns = [
      {
        label: i18n.t('events:popover.view'),
        icon: <EyeIcon className="menu-icon" />,
        onClick: onView,
      },
      {
        label: i18n.t('general:edit', { item: '' }),
        icon: <PencilIcon className="menu-icon" />,
        onClick: onEdit,
      },
      {
        label: i18n.t('events:popover.publish'),
        icon: <CloudArrowUpIcon className="menu-icon" />,
        onClick: onPublish,
      },
      {
        label: i18n.t('events:popover.delete'),
        icon: <TrashIcon className="menu-icon" />,
        onClick: onDelete,
        alert: true,
      },
    ];

    return {
      name: i18n.t('events:table.actions'),
      cell: (row: IEvent) => (
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="btn-outline-secondary py-1.5"
            aria-label={`${i18n.t('events:table.view_label', { name: row.name })}`}
            onClick={() => onView(row)}
          >
            {i18n.t('events:table.view')}
          </button>
          <Popover<IEvent>
            row={row}
            items={
              row.status === EventStatus.PUBLISHED
                ? EventsArchiveActionColumns
                : EventsPublishActionColumns
            }
          />
        </div>
      ),
      width: '120px',
      allowOverflow: true,
    };
  };

  const onExport = async () => {
    const { data: eventsData } = await getEventsForDownload(
      query.eventState as EventState,
      query.orderBy,
      query.orderDirection as OrderDirection,
      query.departmentId,
      search,
    );

    downloadExcel(eventsData as BlobPart, i18n.t('events:download', { context: query.eventState }));
  };

  const onAddEvent = () => {
    navigate('/events/add');
  };

  const onRowsPerPageChange = (limit: number) => {
    setQuery(
      {
        limit,
        page: 1,
      },
      'replaceIn',
    );
  };

  const onChangePage = (page: number) => {
    setQuery(
      {
        page,
      },
      'replaceIn',
    );
  };

  const onSort = (column: TableColumn<IEvent>, direction: SortOrder) => {
    setQuery(
      {
        orderBy: column.id as string,
        orderDirection:
          direction.toLocaleUpperCase() === OrderDirection.ASC
            ? OrderDirection.ASC
            : OrderDirection.DESC,
      },
      'replaceIn',
    );
  };

  // audit, major 11: one number per thing. Upcoming / ongoing / past are counted on the tabs (with
  // the filters applied), so the cards that repeated them and the "N evenimente găsite" line are gone.
  const COUNTERS = [{ key: 'participants', Icon: UsersIcon, color: 'text-figure-teal' }] as const;

  return (
    <PageLayout>
      <PageHeader
        subtitle={`${i18n.t('events:page.subtitle')}`}
        actions={
          <Button
            label={i18n.t('events:page.add')}
            icon={<PlusIcon className="h-5 w-5" />}
            className="btn-primary"
            onClick={onAddEvent}
            {...gate}
          />
        }
      >
        {i18n.t('side_menu:options.events')}
      </PageHeader>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 xl:gap-6">
        {COUNTERS.map(({ key, Icon, color }) => (
          <StatisticsCard
            key={key}
            label={`${i18n.t(`events:counters.${key}`)}`}
            value={`${counters?.[key] ?? '-'}`}
            icon={<Icon className={`w-5 h-5 ${color}`} aria-hidden="true" />}
            info={
              <span className="text-cool-gray-500 font-roboto">
                {i18n.t(`events:counters_info.${key}`)}
              </span>
            }
          />
        ))}
      </div>
      <DataTableFilters
        onSearch={onSearch}
        searchValue={query?.search}
        searchPlaceholder={i18n.t('events:page.search').toString()}
        onResetFilters={onResetFilters}
        results={
          <>
            <Button
              label={i18n.t('general:download_table')}
              icon={<ArrowDownTrayIcon className="h-5 w-5 text-cool-gray-600" />}
              className="btn-text-primary px-2"
              onClick={onExport}
            />
          </>
        }
      >
        <SelectFilter
          label={`${i18n.t('events:filters.department')}`}
          placeholder={`${i18n.t('events:filters.all_departments')}`}
          options={(departments?.items ?? []).map((department) => ({
            key: department.id,
            value: department.name,
          }))}
          onChange={onDepartmentChange}
          defaultValue={query?.departmentId}
          allowDeselect
        />
      </DataTableFilters>
      <Tabs<EventState> tabs={tabs} onClick={onTabClick} defaultTab={currentTab(query?.eventState)}>
        <Card>
          <CardBody>
            {!isEventsLoading && !events?.items?.length ? (
              <p className="py-12 text-center text-cool-gray-500">{i18n.t('events:page.empty')}</p>
            ) : (
              <DataTableComponent
                columns={[
                  nameColumn,
                  periodColumn,
                  locationColumn,
                  departmentsColumn,
                  participantsColumn,
                  ...(query.eventState === EventState.PAST ? [hoursColumn] : []),
                  statusColumn,
                  buildEventsActionColumn(),
                ]}
                data={events?.items}
                loading={
                  isEventsLoading || isArchivingEvent || isDeletingEvent || isPublishingEvent
                }
                pagination
                paginationPerPage={query.limit}
                paginationTotalRows={events?.meta?.totalItems}
                paginationDefaultPage={query.page}
                onChangeRowsPerPage={onRowsPerPageChange}
                onChangePage={onChangePage}
                onSort={onSort}
              />
            )}
          </CardBody>
        </Card>
      </Tabs>
      {showDeleteEvent && (
        <ConfirmationModal
          title={i18n.t('events:modal.title')}
          description={i18n.t('events:modal.description_name', { name: showDeleteEvent.name })}
          confirmBtnLabel={i18n.t('division:modal.delete.title', {
            division: i18n.t('general:event').toLowerCase(),
          })}
          confirmBtnClassName="btn-danger"
          onClose={setShowDeleteEvent.bind(null, null)}
          onConfirm={confirmDelete}
        />
      )}
    </PageLayout>
  );
};

export default Events;
