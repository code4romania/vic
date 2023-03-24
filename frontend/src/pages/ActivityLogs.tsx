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
import {
  useActivityLogQuery,
  useActivityLogsQuery,
} from '../services/activity-log/activity-log.service';
import { IActivityLogListItem } from '../common/interfaces/activity-log.interface';
import CellLayout from '../layouts/CellLayout';
import StatusWithMarker from '../components/StatusWithMarker';
import { useNavigate } from 'react-router';
import EditActivityLog from '../components/EditActivityLog';
import ActivityLogSidePanel from '../components/ActivityLogSidePanel';
import { ActivityLogResolutionStatus } from '../common/enums/activity-log-resolution-status.enum';

const ActivityLogTabsOptions: SelectItem<ActivityLogResolutionStatus>[] = [
  { key: ActivityLogResolutionStatus.NEW, value: i18n.t('activity_log:pending') },
  { key: ActivityLogResolutionStatus.SOLVED, value: i18n.t('activity_log:past') },
];

const PendingActivityLogTableHeader = [
  {
    id: 'activityType.name',
    name: i18n.t('activity_log:header.task'),
    sortable: true,
    grow: 3,
    minWidth: '10rem',
    cell: (row: IActivityLogListItem) => (
      <MediaCell
        logo={row.activityType?.icon}
        title={row.activityType.name}
        subtitle={row.event?.name || ''}
      />
    ),
  },
  {
    id: 'hours',
    name: i18n.t('general:hours'),
    sortable: true,
    grow: 1,
    minWidth: '5rem',
    selector: (row: IActivityLogListItem) => `${row.hours}h`,
  },
  {
    id: 'date',
    name: i18n.t('activity_log:header.execution_date'),
    sortable: true,
    grow: 1,
    minWidth: '5rem',
    selector: (row: IActivityLogListItem) => formatDate(row?.date),
  },
  {
    id: 'user.name',
    name: i18n.t('volunteer:name', { status: '' }),
    sortable: true,
    grow: 1,
    minWidth: '5rem',
    cell: (row: IActivityLogListItem) =>
      row.volunteer && (
        <CellLayout>
          <a>{row.volunteer.name}</a>
        </CellLayout>
      ),
  },
  {
    id: 'createdOn',
    name: i18n.t('activity_log:header.registration_date'),
    sortable: true,
    grow: 1,
    minWidth: '5rem',
    selector: (row: IActivityLogListItem) => formatDate(row.createdOn),
  },
];

const PastActivityLogTableHeader = [
  {
    id: 'activityType.name',
    name: i18n.t('activity_log:header.task'),
    sortable: true,
    grow: 3,
    minWidth: '10rem',
    cell: (row: IActivityLogListItem) => (
      <MediaCell
        logo={row.activityType?.icon}
        title={row.activityType.name}
        subtitle={row.event?.name || ''}
      />
    ),
  },
  {
    id: 'hours',
    name: i18n.t('general:hours'),
    sortable: true,
    grow: 1,
    minWidth: '5rem',
    selector: (row: IActivityLogListItem) => `${row.hours}h`,
  },
  {
    id: 'date',
    name: i18n.t('activity_log:header.execution_date'),
    sortable: true,
    grow: 1,
    minWidth: '5rem',
    selector: (row: IActivityLogListItem) => formatDate(row.date),
  },
  {
    id: 'user.name',
    name: i18n.t('volunteer:name', { status: '' }),
    sortable: true,
    grow: 1,
    minWidth: '5rem',
    cell: (row: IActivityLogListItem) =>
      row.volunteer && (
        <CellLayout>
          <a>{row.volunteer?.name}</a>
        </CellLayout>
      ),
  },
  {
    id: 'status',
    name: i18n.t('activity_log:status'),
    sortable: true,
    grow: 1,
    minWidth: '5rem',
    cell: (row: IActivityLogListItem) => (
      <CellLayout>
        <StatusWithMarker markerColor={ActivityLogStatusMarkerColorMapper[row.status]}>
          {i18n.t(`activity_log:display_status.${row.status}`)}
        </StatusWithMarker>
      </CellLayout>
    ),
  },
];

const ActivityLogs = () => {
  // routing
  const navigate = useNavigate();
  // active tab
  const [activeTab, setActiveTab] = useState<ActivityLogResolutionStatus>(
    ActivityLogResolutionStatus.NEW,
  );
  // pagination state
  const [page, setPage] = useState<number>();
  const [rowsPerPage, setRowsPerPage] = useState<number>();
  const [orderByColumn, setOrderByColumn] = useState<string>();
  const [orderDirection, setOrderDirection] = useState<OrderDirection>();

  // selected activity log id
  const [selectedActivityLog, setSelectedActivityLog] = useState<string | null>(null);
  // side panel state
  const [isViewActivityLogSidePanelOpen, setIsViewActivityLogSidePanelOpen] =
    useState<boolean>(false);
  const [isEditctivityLogSidePanelOpen, setIsEditActivityLogSidePanelOpen] =
    useState<boolean>(false);

  // get all query
  const {
    data: activityLogs,
    isLoading: isActivityLogsLoading,
    error: activityLogsError,
    refetch,
  } = useActivityLogsQuery(
    rowsPerPage as number,
    page as number,
    activeTab,
    orderByColumn,
    orderDirection,
  );

  // get one query
  const { data: activityLog, error: activityLogError } = useActivityLogQuery(
    selectedActivityLog as string,
  );

  // query error handling
  useEffect(() => {
    if (activityLogsError)
      useErrorToast(
        InternalErrors.ACTIVITY_LOG_ERRORS.getError(activityLogsError.response?.data.code_error),
      );
    if (activityLogError)
      useErrorToast(
        InternalErrors.ACTIVITY_LOG_ERRORS.getError(activityLogError.response?.data.code_error),
      );
  }, [activityLogsError, activityLogError]);

  // menu items
  const buildActivityLogActionColumn = (): TableColumn<IActivityLogListItem> => {
    const activeVolunteersMenuItems = [
      {
        label: i18n.t('activity_log:popover.view'),
        icon: <EyeIcon className="menu-icon" />,
        onClick: onView,
      },
    ];

    return {
      name: '',
      cell: (row: IActivityLogListItem) => (
        <Popover<IActivityLogListItem> row={row} items={activeVolunteersMenuItems} />
      ),
      width: '50px',
      allowOverflow: true,
    };
  };

  const onAddButtonPress = () => {
    navigate('add');
  };

  const onView = (row: IActivityLogListItem) => {
    setSelectedActivityLog(row.id);
    setIsViewActivityLogSidePanelOpen(true);
  };

  const onEdit = () => {
    setIsViewActivityLogSidePanelOpen(false);
    setIsEditActivityLogSidePanelOpen(true);
  };

  const onCloseEditSidePanel = (shouldRefetch?: boolean) => {
    setIsViewActivityLogSidePanelOpen(true);
    setIsEditActivityLogSidePanelOpen(false);
    if (shouldRefetch) refetch();
  };

  const onTabClick = (tab: ActivityLogResolutionStatus) => {
    setActiveTab(tab);
  };

  const onCloseSidePanel = (shouldRefetch?: boolean) => {
    setIsViewActivityLogSidePanelOpen(false);
    setSelectedActivityLog(null);
    if (shouldRefetch) refetch();
  };

  // pagination
  const onSort = (column: TableColumn<IActivityLogListItem>, direction: SortOrder) => {
    setOrderByColumn(column.id as string);
    setOrderDirection(
      direction.toLocaleUpperCase() === OrderDirection.ASC
        ? OrderDirection.ASC
        : OrderDirection.DESC,
    );
  };

  return (
    <PageLayout>
      <PageHeaderAdd onAddButtonPress={onAddButtonPress} label={i18n.t('activity_log:add')}>
        {i18n.t('side_menu:options.activity_log')}
      </PageHeaderAdd>
      <p className="text-cool-gray-500">{i18n.t('activity_log:description')}</p>
      <Tabs<ActivityLogResolutionStatus> tabs={ActivityLogTabsOptions} onClick={onTabClick}>
        <Card>
          <CardHeader>
            {/* <h2>
              {tabsStatus === ActivityLogTabs.PENDING
                ? i18n.t('activity_log:pending_header', {
                    hours: activityLogs?.count?.pending || '-',
                  })
                : `${i18n.t('activity_log:past_header', {
                    hours: activityLogs?.count?.approved || '-',
                    rejected: activityLogs?.count?.rejected || '-',
                  })}`}
            </h2> */}
          </CardHeader>
          <CardBody>
            <DataTableComponent
              columns={[
                ...(activeTab === ActivityLogResolutionStatus.NEW
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
      <ActivityLogSidePanel
        onClose={onCloseSidePanel}
        onEdit={onEdit}
        isOpen={isViewActivityLogSidePanelOpen}
        activityLog={activityLog}
      />
      <EditActivityLog
        onClose={onCloseEditSidePanel}
        isOpen={isEditctivityLogSidePanelOpen}
        activityLog={activityLog}
      />
    </PageLayout>
  );
};

export default ActivityLogs;
