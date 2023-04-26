import React, { useEffect, useState } from 'react';
import {
  ArrowDownTrayIcon,
  CloudArrowUpIcon,
  DocumentMinusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { SortOrder, TableColumn } from 'react-data-table-component';
import i18n from '../common/config/i18n';
import { OrderDirection } from '../common/enums/order-direction.enum';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { IEvent } from '../common/interfaces/event.interface';
import Button from '../components/Button';
import CardBody from '../components/CardBody';
import CardHeader from '../components/CardHeader';
import DataTableComponent from '../components/DataTableComponent';
import Popover from '../components/Popover';
import { SelectItem } from '../components/Select';
import Tabs from '../components/Tabs';
import { useErrorToast, useSuccessToast } from '../hooks/useToast';
import Card from '../layouts/CardLayout';
import PageLayout from '../layouts/PageLayout';
import { EventState } from '../common/enums/event-state.enum';
import {
  useArchiveEventMutation,
  useDeleteEventMutation,
  useEventsQuery,
  usePublishEventMutation,
} from '../services/event/event.service';
import { downloadExcel, formatEventDate } from '../common/utils/utils';
import { EventStatusMarkerColorMapper } from '../common/utils/utils';
import MediaCell from '../components/MediaCell';
import PageHeaderAdd from '../components/PageHeaderAdd';
import CellLayout from '../layouts/CellLayout';
import { useNavigate } from 'react-router-dom';
import { EventStatus } from '../common/enums/event-status';
import ConfirmationModal from '../components/ConfirmationModal';
import StatusWithMarker from '../components/StatusWithMarker';
import Targets from '../components/Targets';
import { getEventsForDownload } from '../services/event/event.api';
import { EventsProps } from '../containers/query/EventsWithQueryParams';

const EventsTabsOptions: SelectItem<EventState>[] = [
  { key: EventState.OPEN, value: i18n.t('side_menu:options.events') },
  { key: EventState.PAST, value: i18n.t('events:past_events') },
];

const OpenEventsTableHeader = [
  {
    id: 'name',
    name: i18n.t('general:event'),
    sortable: true,
    minWidth: '10rem',
    grow: 2,
    cell: (row: IEvent) => <MediaCell logo={row.image} title={row.name} />,
  },
  {
    id: 'startDate',
    name: i18n.t('general:date'),
    minWidth: '11rem',
    grow: 1,
    sortable: true,
    cell: (row: IEvent) => <CellLayout>{formatEventDate(row.startDate, row.endDate)}</CellLayout>,
  },
  {
    id: 'target',
    name: i18n.t('general:target'),
    minWidth: '10rem',
    grow: 1,
    cell: (row: IEvent) => (
      <CellLayout>
        <Targets targets={row.targets} isPublic={row.isPublic} />
      </CellLayout>
    ),
  },
  {
    id: 'going',
    name: i18n.t('general:answers'),
    minWidth: '9rem',
    grow: 1,
    selector: (row: IEvent) =>
      `${row.going || 0} ${i18n.t('events:participate').toLowerCase()}\n${row.notGoing || 0} ${i18n
        .t('events:not_participate')
        .toLowerCase()}`,
  },
  {
    id: 'status',
    name: i18n.t('events:status'),
    minWidth: '5rem',
    grow: 1,
    sortable: true,
    cell: (row: IEvent) => (
      <CellLayout>
        <StatusWithMarker markerColor={EventStatusMarkerColorMapper[row.status]}>
          {i18n.t(`events:display_status.${row.status}`)}
        </StatusWithMarker>
      </CellLayout>
    ),
  },
];

const PastEventsTableHeader = [
  {
    id: 'name',
    name: i18n.t('general:event'),
    minWidth: '10rem',
    grow: 2,
    sortable: true,
    cell: (row: IEvent) => <MediaCell logo={row.image} title={row.name} />,
  },
  {
    id: 'startDate',
    name: i18n.t('general:date'),
    minWidth: '11rem',
    grow: 1,
    sortable: true,
    cell: (row: IEvent) => <CellLayout>{formatEventDate(row.startDate, row.endDate)}</CellLayout>,
  },
  {
    id: 'target',
    name: i18n.t('general:target'),
    minWidth: '10rem',
    grow: 1,
    cell: (row: IEvent) => (
      <CellLayout>
        <Targets targets={row.targets} isPublic={row.isPublic} />
      </CellLayout>
    ),
  },
  {
    id: 'going',
    name: i18n.t('general:answers'),
    minWidth: '9rem',
    grow: 1,
    selector: (row: IEvent) =>
      `${row.going || 0} ${i18n.t('events:participate').toLowerCase()}\n${row.notGoing || 0} ${i18n
        .t('events:not_participate')
        .toLowerCase()}`,
  },
  {
    id: 'hours',
    name: i18n.t('events:hours'),
    minWidth: '5rem',
    grow: 1,
    cell: (row: IEvent) => (
      <CellLayout>{`${row.activityLogged?.volunteers} ${i18n.t('general:people').toLowerCase()}\n${
        row.activityLogged?.totalHours
      } ${i18n.t('general:hours').toLowerCase()}`}</CellLayout>
    ),
  },
  {
    id: 'status',
    name: i18n.t('events:status'),
    sortable: true,
    cell: (row: IEvent) => (
      <CellLayout>
        <StatusWithMarker markerColor={EventStatusMarkerColorMapper[row.status]}>
          {i18n.t(`events:display_status.${row.status}`)}
        </StatusWithMarker>
      </CellLayout>
    ),
  },
];

const Events = ({ query, setQuery }: EventsProps) => {
  const [showDeleteEvent, setShowDeleteEvent] = useState<null | IEvent>();

  const navigate = useNavigate();

  // access requests query
  const {
    data: events,
    isLoading: isEventsLoading,
    error: eventsError,
    refetch,
  } = useEventsQuery(
    query.limit as number,
    query.page as number,
    query.eventState as EventState,
    query.orderBy,
    query.orderDirection as OrderDirection,
  );
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
    setQuery({ eventState: tab }, 'push');
  };

  // row actions
  const onView = (row: IEvent) => {
    navigate(`${row.id}`, { replace: true });
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
    navigate(`${row.id}/edit`, { replace: true });
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
      name: '',
      cell: (row: IEvent) => (
        <Popover<IEvent>
          row={row}
          items={
            row.status === EventStatus.PUBLISHED
              ? EventsArchiveActionColumns
              : EventsPublishActionColumns
          }
        />
      ),
      width: '50px',
      allowOverflow: true,
    };
  };

  const onExport = async () => {
    const { data: eventsData } = await getEventsForDownload(
      query.eventState as EventState,
      query.orderBy,
      query.orderDirection as OrderDirection,
    );

    downloadExcel(eventsData as BlobPart, i18n.t('events:download', { context: query.eventState }));
  };

  const onAddEvent = () => {
    navigate('/events/add');
  };

  const onRowsPerPageChange = (limit: number) => {
    setQuery({
      limit,
      page: 1,
    });
  };

  const onChangePage = (page: number) => {
    setQuery({
      page,
    });
  };

  const onSort = (column: TableColumn<IEvent>, direction: SortOrder) => {
    setQuery({
      orderBy: column.id as string,
      orderDirection:
        direction.toLocaleUpperCase() === OrderDirection.ASC
          ? OrderDirection.ASC
          : OrderDirection.DESC,
    });
  };

  return (
    <PageLayout>
      <PageHeaderAdd
        label={`${i18n.t('general:add', { item: i18n.t('general:event').toLowerCase() })}`}
        onAddButtonPress={onAddEvent}
      >
        {i18n.t('side_menu:options.events')}
      </PageHeaderAdd>
      <Tabs<EventState>
        tabs={EventsTabsOptions}
        onClick={onTabClick}
        defaultTab={
          query?.eventState
            ? EventsTabsOptions.find((tab) => tab.key === query?.eventState)
            : EventsTabsOptions[0]
        }
      >
        <Card>
          <CardHeader>
            <h2>
              {query.eventState === EventState.OPEN
                ? i18n.t('side_menu:options.events')
                : i18n.t('events:past_events')}
            </h2>
            <Button
              label={i18n.t('general:download_table')}
              icon={<ArrowDownTrayIcon className="h-5 w-5 text-cool-gray-600" />}
              className="btn-outline-secondary ml-auto"
              onClick={onExport}
            />
          </CardHeader>
          <CardBody>
            <DataTableComponent
              columns={[
                ...(query.eventState === EventState.PAST
                  ? PastEventsTableHeader
                  : OpenEventsTableHeader),
                buildEventsActionColumn(),
              ]}
              data={events?.items}
              loading={isEventsLoading || isArchivingEvent || isDeletingEvent || isPublishingEvent}
              pagination
              paginationPerPage={query.limit}
              paginationTotalRows={events?.meta?.totalItems}
              paginationDefaultPage={query.page}
              onChangeRowsPerPage={onRowsPerPageChange}
              onChangePage={onChangePage}
              onSort={onSort}
            />
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
