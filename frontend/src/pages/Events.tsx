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
import { formatEventDate } from '../common/utils/utils';
import { EventStatusMarkerColorMapper } from '../common/utils/utils';
import MediaCell from '../components/MediaCell';
import PageHeaderAdd from '../components/PageHeaderAdd';
import CellLayout from '../layouts/CellLayout';
import { useNavigate } from 'react-router-dom';
import { EventStatus } from '../common/enums/event-status';
import ConfirmationModal from '../components/ConfirmationModal';
import StatusWithMarker from '../components/StatusWithMarker';
import Targets from '../components/Targets';

const EventsTabsOptions: SelectItem<EventState>[] = [
  { key: EventState.OPEN, value: i18n.t('side_menu:options.events') },
  { key: EventState.PAST, value: i18n.t('events:past_events') },
];

const OpenEventsTableHeader = [
  {
    id: 'name',
    name: i18n.t('general:event'),
    sortable: true,
    cell: (row: IEvent) => <MediaCell logo={row.logo} title={row.name} />,
  },
  {
    id: 'startDate',
    name: i18n.t('general:date'),
    sortable: true,
    selector: (row: IEvent) => formatEventDate(row.startDate, row.endDate),
  },
  {
    id: 'target',
    name: i18n.t('general:target'),
    cell: (row: IEvent) => (
      <CellLayout>
        <Targets targets={row.targets} />
      </CellLayout>
    ),
  },
  {
    id: 'going',
    name: i18n.t('general:answers'),
    selector: (row: IEvent) =>
      `${row.going || 0} ${i18n.t('events:participate')}\n${row.notGoing || 0} ${i18n.t(
        'events:not_participate',
      )}`,
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

const PastEventsTableHeader = [
  {
    id: 'name',
    name: i18n.t('general:event'),
    sortable: true,
    cell: (row: IEvent) => <MediaCell logo={row.logo} title={row.name} />,
  },
  {
    id: 'startDate',
    name: i18n.t('general:date'),
    sortable: true,
    selector: (row: IEvent) => formatEventDate(row.startDate, row.endDate),
  },
  {
    id: 'target',
    name: i18n.t('general:target'),
    sortable: true,
    cell: (row: IEvent) => (
      <CellLayout>
        <Targets targets={row.targets} />
      </CellLayout>
    ),
  },
  {
    id: 'going',
    name: i18n.t('general:answers'),
    selector: (row: IEvent) =>
      `${row.going || 0} ${i18n.t('events:participate')}\n${row.notGoing || 0} ${i18n.t(
        'events:not_participate',
      )}`,
  },
  {
    id: 'going',
    name: i18n.t('events:hours'),
    selector: (row: IEvent) =>
      `${row.going || 0} ${i18n.t('general:people').toLowerCase()}\n${row.notGoing || 0} ${i18n
        .t('general:hours')
        .toLowerCase()}`,
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

const Events = () => {
  const [showDeleteEvent, setShowDeleteEvent] = useState<null | IEvent>();
  const [tabsStatus, setTabsStatus] = useState<EventState>(EventState.OPEN);
  // pagination state
  const [page, setPage] = useState<number>();
  const [rowsPerPage, setRowsPerPage] = useState<number>();
  const [orderByColumn, setOrderByColumn] = useState<string>();
  const [orderDirection, setOrderDirection] = useState<OrderDirection>(OrderDirection.ASC);

  const navigate = useNavigate();

  // access requests query
  const {
    data: events,
    isLoading: isEventsLoading,
    error: eventsError,
    refetch,
  } = useEventsQuery(
    rowsPerPage as number,
    page as number,
    tabsStatus,
    orderByColumn,
    orderDirection,
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
    setTabsStatus(tab);
  };

  // row actions
  const onView = (row: IEvent) => {
    navigate(`${row.id}`, { replace: true });
  };

  const onPublish = (row: IEvent) => {
    publishEvent(row.id, {
      onSuccess: () => {
        useSuccessToast('events:form.submit.published');
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
        useSuccessToast('events:form.submit.archived');
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
          useSuccessToast('events:modal.delete');
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

  const onSort = (column: TableColumn<IEvent>, direction: SortOrder) => {
    setOrderByColumn(column.id as string);
    setOrderDirection(
      direction.toLocaleUpperCase() === OrderDirection.ASC
        ? OrderDirection.ASC
        : OrderDirection.DESC,
    );
  };

  const onAddEvent = () => {
    navigate('/events/add');
  };

  return (
    <PageLayout>
      <PageHeaderAdd
        label={`${i18n.t('general:add', { item: i18n.t('general:event').toLowerCase() })}`}
        onAddButtonPress={onAddEvent}
      >
        {i18n.t('side_menu:options.events')}
      </PageHeaderAdd>
      <Tabs<EventState> tabs={EventsTabsOptions} onClick={onTabClick}>
        <Card>
          <CardHeader>
            <h2>
              {tabsStatus === EventState.OPEN
                ? i18n.t('side_menu:options.events')
                : i18n.t('events:past_events')}
            </h2>
            <Button
              label={i18n.t('general:download_table')}
              icon={<ArrowDownTrayIcon className="h-5 w-5 text-cool-gray-600" />}
              className="btn-outline-secondary ml-auto"
              onClick={() => alert('Not implemented')}
            />
          </CardHeader>
          <CardBody>
            <DataTableComponent
              columns={[
                ...(tabsStatus === EventState.PAST ? PastEventsTableHeader : OpenEventsTableHeader),
                buildEventsActionColumn(),
              ]}
              data={events?.items}
              loading={isEventsLoading || isArchivingEvent || isDeletingEvent || isPublishingEvent}
              pagination
              paginationPerPage={rowsPerPage}
              paginationTotalRows={events?.meta?.totalItems}
              paginationDefaultPage={page}
              onChangeRowsPerPage={setRowsPerPage}
              onChangePage={setPage}
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
