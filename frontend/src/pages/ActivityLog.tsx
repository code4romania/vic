import React, { useEffect, useState } from 'react';
import PageLayout from '../layouts/PageLayout';
import Card from '../layouts/CardLayout';
import CardHeader from '../components/CardHeader';
import CardBody from '../components/CardBody';
import Tabs from '../components/Tabs';
import DataTableComponent from '../components/DataTableComponent';
import i18n from '../common/config/i18n';
import { EyeIcon } from '@heroicons/react/24/outline';
import { SortOrder, TableColumn } from 'react-data-table-component';
import Popover from '../components/Popover';
import { OrderDirection } from '../common/enums/order-direction.enum';
import { SelectItem } from '../components/Select';
import { ActivityLogStatusMarkerColorMapper, formatDate } from '../common/utils/utils';
import { useErrorToast } from '../hooks/useToast';
import { InternalErrors } from '../common/errors/internal-errors.class';
import MediaCell from '../components/MediaCell';
import PageHeaderAdd from '../components/PageHeaderAdd';
import { useActivityLogsQuery } from '../services/acitivity-log/activity-log.service';
import { IActivityLog } from '../common/interfaces/activity-log.interface';
import CellLayout from '../layouts/CellLayout';
import StatusWithMarker from '../components/StatusWithMarker';
import { useNavigate } from 'react-router';

export enum ActivityLogTabs {
  PENDING = 'pending',
  PAST = 'past',
}

const ActivityLogTabsOptions: SelectItem<ActivityLogTabs>[] = [
  { key: ActivityLogTabs.PENDING, value: i18n.t('activity_log:pending') },
  { key: ActivityLogTabs.PAST, value: i18n.t('activity_log:past') },
];

const ActivityLog = () => {
  const navigate = useNavigate();
  const [tabsStatus, setTabsStatus] = useState<ActivityLogTabs>(ActivityLogTabs.PENDING);
  // pagination state
  const [page, setPage] = useState<number>();
  const [rowsPerPage, setRowsPerPage] = useState<number>();
  const [orderByColumn, setOrderByColumn] = useState<string>();
  const [orderDirection, setOrderDirection] = useState<OrderDirection>();

  const {
    data: activityLogs,
    isLoading: isActivityLogsLoading,
    error: activityLogsError,
  } = useActivityLogsQuery(
    rowsPerPage as number,
    page as number,
    tabsStatus,
    orderByColumn,
    orderDirection,
  );

  useEffect(() => {
    if (activityLogsError)
      useErrorToast(
        InternalErrors.ACTIVITY_LOG_ERRORS.getError(activityLogsError.response?.data.code_error),
      );
  }, [activityLogsError]);

  const onVolunteerClick = (id: string) => {
    navigate(`/volunteers/${id}`);
  };

  const onTabClick = (tab: ActivityLogTabs) => {
    setTabsStatus(tab);
  };

  // menu items
  const buildActivityLogActionColumn = (): TableColumn<IActivityLog> => {
    const activeVolunteersMenuItems = [
      {
        label: i18n.t('activity_log:popover.view'),
        icon: <EyeIcon className="menu-icon" />,
        onClick: onView,
      },
    ];

    return {
      name: '',
      cell: (row: IActivityLog) => (
        <Popover<IActivityLog> row={row} items={activeVolunteersMenuItems} />
      ),
      width: '50px',
      allowOverflow: true,
    };
  };

  // row actions
  const onView = (row: IActivityLog) => {
    alert(`not yet implemented ${row.id}`);
  };

  const onSort = (column: TableColumn<IActivityLog>, direction: SortOrder) => {
    setOrderByColumn(column.id as string);
    setOrderDirection(
      direction.toLocaleUpperCase() === OrderDirection.ASC
        ? OrderDirection.ASC
        : OrderDirection.DESC,
    );
  };

  const onAddButtonPress = () => {
    alert('not yet implemented');
  };

  const PendingActivityLogTableHeader = [
    {
      id: 'activityLog.task',
      name: 'Task',
      sortable: true,
      grow: 2,
      minWidth: '10rem',
      cell: (row: IActivityLog) => <MediaCell logo={row.task?.icon || ''} title={row.task.name} />,
    },
    {
      id: 'activityLog.hours',
      name: i18n.t('general:hours'),
      sortable: true,
      grow: 1,
      minWidth: '5rem',
      selector: (row: IActivityLog) => `${row.hours}h`,
    },
    {
      id: 'activityLog.execution',
      name: i18n.t('activity_log:execution_date'),
      sortable: true,
      grow: 1,
      minWidth: '5rem',
      selector: (row: IActivityLog) => formatDate(row.executionDate),
    },
    {
      id: 'activityLog.volunteer',
      name: i18n.t('volunteer:name', { status: '' }),
      sortable: true,
      grow: 1,
      minWidth: '5rem',
      cell: (row: IActivityLog) => (
        <CellLayout>
          <a onClick={onVolunteerClick.bind(null, row.volunteer.id)}>{row.volunteer.name}</a>
        </CellLayout>
      ),
    },
    {
      id: 'activityLog.registration',
      name: i18n.t('activity_log:registration_date'),
      sortable: true,
      grow: 1,
      minWidth: '5rem',
      selector: (row: IActivityLog) => formatDate(row.registrationDate),
    },
  ];

  const PastActivityLogTableHeader = [
    {
      id: 'activityLog.task',
      name: 'Task',
      sortable: true,
      grow: 2,
      minWidth: '10rem',
      cell: (row: IActivityLog) => <MediaCell logo={row.task?.icon || ''} title={row.task.name} />,
    },
    {
      id: 'activityLog.hours',
      name: i18n.t('general:hours'),
      sortable: true,
      grow: 1,
      minWidth: '5rem',
      selector: (row: IActivityLog) => `${row.hours}h`,
    },
    {
      id: 'activityLog.execution',
      name: i18n.t('activity_log:execution_date'),
      sortable: true,
      grow: 1,
      minWidth: '5rem',
      selector: (row: IActivityLog) => formatDate(row.executionDate),
    },
    {
      id: 'activityLog.volunteer',
      name: i18n.t('volunteer:name', { status: '' }),
      sortable: true,
      grow: 1,
      minWidth: '5rem',
      cell: (row: IActivityLog) => (
        <CellLayout>
          <a onClick={onVolunteerClick.bind(null, row.volunteer.id)}>{row.volunteer.name}</a>
        </CellLayout>
      ),
    },
    {
      id: 'activityLog.status',
      name: i18n.t('activity_log:status'),
      sortable: true,
      grow: 1,
      minWidth: '5rem',
      cell: (row: IActivityLog) => (
        <CellLayout>
          <StatusWithMarker markerColor={ActivityLogStatusMarkerColorMapper[row.status]}>
            {i18n.t(`activity_log:display_status.${row.status}`)}
          </StatusWithMarker>
        </CellLayout>
      ),
    },
  ];

  return (
    <PageLayout>
      <PageHeaderAdd onAddButtonPress={onAddButtonPress} label={i18n.t('activity_log:add')}>
        {i18n.t('side_menu:options.activity_log')}
      </PageHeaderAdd>
      <Tabs<ActivityLogTabs> tabs={ActivityLogTabsOptions} onClick={onTabClick}>
        <Card>
          <CardHeader>
            <h2>
              {tabsStatus === ActivityLogTabs.PENDING
                ? i18n.t('activity_log:pending_header', {
                    hours: activityLogs?.count.pending || '-',
                  })
                : `${i18n.t('activity_log:past_header', {
                    hours: activityLogs?.count.approved || '-',
                    rejected: activityLogs?.count.rejected || '-',
                  })}`}
            </h2>
          </CardHeader>
          <CardBody>
            <DataTableComponent
              columns={[
                ...(tabsStatus === ActivityLogTabs.PENDING
                  ? PendingActivityLogTableHeader
                  : PastActivityLogTableHeader),
                buildActivityLogActionColumn(),
              ]}
              data={activityLogs?.items}
              loading={isActivityLogsLoading}
              pagination
              paginationPerPage={rowsPerPage}
              paginationTotalRows={activityLogs?.meta?.totalItems}
              paginationDefaultPage={page}
              onChangeRowsPerPage={setRowsPerPage}
              onChangePage={setPage}
              onSort={onSort}
            />
          </CardBody>
        </Card>
      </Tabs>
    </PageLayout>
  );
};

export default ActivityLog;
