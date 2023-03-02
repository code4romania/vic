import React, { useEffect, useState } from 'react';
import {
  ArrowDownTrayIcon,
  DocumentIcon,
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
import MediaCell from '../components/MediaCell';
import PageHeader from '../components/PageHeader';
import Popover from '../components/Popover';
import { SelectItem } from '../components/Select';
import Tabs from '../components/Tabs';
import { useErrorToast } from '../hooks/useToast';
import Card from '../layouts/CardLayout';
import PageLayout from '../layouts/PageLayout';
import { EventsTabsStatus } from '../common/enums/event-status.enum';
import { useEventsQuery } from '../services/event/event.service';

const EventsTabs: SelectItem<EventsTabsStatus>[] = [
  { key: EventsTabsStatus.OPEN, value: i18n.t('side_menu:options.events') },
  { key: EventsTabsStatus.PAST, value: i18n.t('events:past_events') },
];

const OpenEventsTableHeader = [
  {
    id: 'event.name',
    name: i18n.t('general:event'),
    sortable: true,
    cell: (row: IEvent) => <MediaCell logo={''} title={row.name} />,
  },
  {
    id: 'event.date',
    name: i18n.t('general:date'),
    sortable: true,
    selector: (row: IEvent) => `${row.startDate}\n${row.endDate}`,
  },
  {
    id: 'event.target',
    name: i18n.t('general:target'),
    sortable: true,
    selector: (row: IEvent) => row.target[0].name,
  },
  {
    id: 'event.answers',
    name: i18n.t('general:answers'),
    sortable: true,
    selector: (row: IEvent) => row.rsvp.yes,
  },
  {
    id: 'event.status',
    name: i18n.t('event:status'),
    sortable: true,
    selector: (row: IEvent) => row.displayStatus,
  },
];

const PastEventsTableHeader = [
  {
    id: 'event.name',
    name: i18n.t('general:event'),
    sortable: true,
    cell: (row: IEvent) => <MediaCell logo={''} title={row.name} />,
  },
  {
    id: 'event.date',
    name: i18n.t('general:date'),
    sortable: true,
    selector: (row: IEvent) => `${row.startDate}\n${row.endDate}`,
  },
  {
    id: 'event.target',
    name: i18n.t('general:target'),
    sortable: true,
    selector: (row: IEvent) => row.target[0].name,
  },
  {
    id: 'event.answers',
    name: i18n.t('general:answers'),
    sortable: true,
    selector: (row: IEvent) => row.rsvp.yes,
  },
  {
    id: 'reportedHours',
    name: i18n.t('events:hours'),
    sortable: true,
    selector: (row: IEvent) => row.displayStatus,
  },
  {
    id: 'event.status',
    name: i18n.t('event:status'),
    sortable: true,
    selector: (row: IEvent) => row.displayStatus,
  },
];

interface EventsTable {
  status: EventsTabsStatus;
}

const EventsTable = ({ status }: EventsTable) => {
  // pagination state
  const [page, setPage] = useState<number>();
  const [rowsPerPage, setRowsPerPage] = useState<number>();
  const [orderByColumn, setOrderByColumn] = useState<string>();
  const [orderDirection, setOrderDirection] = useState<OrderDirection>(OrderDirection.ASC);

  // access requests query
  const {
    data: events,
    isLoading: isEventsLoading,
    error: eventsError,
  } = useEventsQuery(rowsPerPage as number, page as number, status, orderByColumn, orderDirection);

  useEffect(() => {
    if (eventsError)
      useErrorToast(InternalErrors.EVENT_ERRORS.getError(eventsError.response?.data.code_error));
  }, [eventsError]);

  // menu items
  const buildEventsActionColumn = (): TableColumn<IEvent> => {
    const EventsActionColumns = [
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
        label: i18n.t('events:popover.draft'),
        icon: <DocumentIcon className="menu-icon" />,
        onClick: onDraft,
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

    return {
      name: '',
      cell: (row: IEvent) => <Popover<IEvent> row={row} items={EventsActionColumns} />,
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

  // row actions
  const onView = (row: IEvent) => {
    console.log('not implemented', row);
  };

  const onDraft = (row: IEvent) => {
    console.log('not implemented', row);
  };

  const onArchive = (row: IEvent) => {
    console.log('not implemented', row);
  };

  const onEdit = (row: IEvent) => {
    console.log('not implemented', row);
  };

  const onDelete = (row: IEvent) => {
    console.log('not implemented', row);
  };

  return (
    <Card>
      <CardHeader>
        <h2>
          {status === EventsTabsStatus.OPEN
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
            ...(status === EventsTabsStatus.PAST ? PastEventsTableHeader : OpenEventsTableHeader),
            buildEventsActionColumn(),
          ]}
          data={events?.items}
          loading={isEventsLoading}
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
  );
};

const Events = () => {
  const [tabsStatus, setTabsStatus] = useState<EventsTabsStatus>(EventsTabsStatus.OPEN);

  const onTabClick = (tab: EventsTabsStatus) => {
    setTabsStatus(tab);
  };

  return (
    <PageLayout>
      <PageHeader>{i18n.t('side_menu:options.events')}</PageHeader>
      <Tabs<EventsTabsStatus> tabs={EventsTabs} onClick={onTabClick}>
        {tabsStatus === EventsTabsStatus.OPEN && <EventsTable status={tabsStatus} />}
        {tabsStatus === EventsTabsStatus.PAST && <EventsTable status={tabsStatus} />}
      </Tabs>
    </PageLayout>
  );
};

export default Events;
