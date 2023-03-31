import React, { useEffect, useState } from 'react';
import Card from '../layouts/CardLayout';
import CardHeader from './CardHeader';
import CardBody from './CardBody';
import DataTableComponent from './DataTableComponent';
import i18n from '../common/config/i18n';
import { ArrowDownTrayIcon, EyeIcon, PlusIcon } from '@heroicons/react/24/outline';
import { SortOrder, TableColumn } from 'react-data-table-component';
import Popover from './Popover';
import { OrderDirection } from '../common/enums/order-direction.enum';
import Select, { SelectItem } from './Select';
import { ActivityLogStatusMarkerColorMapper, formatDate } from '../common/utils/utils';
import { useErrorToast } from '../hooks/useToast';
import { InternalErrors } from '../common/errors/internal-errors.class';
import MediaCell from './MediaCell';
import {
  useActivityLogCounterQuery,
  useActivityLogQuery,
  useActivityLogsQuery,
} from '../services/activity-log/activity-log.service';
import { IActivityLogListItem } from '../common/interfaces/activity-log.interface';
import CellLayout from '../layouts/CellLayout';
import StatusWithMarker from './StatusWithMarker';
import { useNavigate } from 'react-router';
import EditActivityLog from './EditActivityLog';
import ActivityLogSidePanel from './ActivityLogSidePanel';
import DataTableFilters from './DataTableFilters';
import DateRangePicker from './DateRangePicker';
import { ActivityLogStatus } from '../common/enums/activity-log.status.enum';
import { ActivityLogResolutionStatus } from '../common/enums/activity-log-resolution-status.enum';
import Button from './Button';
import AdminSelect from '../containers/AdminSelect';
import { ListItem } from '../common/interfaces/list-item.interface';

const StatusOptions: SelectItem<ActivityLogStatus>[] = [
  { key: ActivityLogStatus.APPROVED, value: i18n.t('activity_log:display_status.approved') },
  { key: ActivityLogStatus.REJECTED, value: i18n.t('activity_log:display_status.rejected') },
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
        title={row.activityType?.name || i18n.t('general:other')}
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
        title={row.activityType?.name || i18n.t('general:other')}
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

const ActivityLogTable = ({
  resolutionStatus,
  volunteerId,
}: {
  resolutionStatus: ActivityLogResolutionStatus;
  volunteerId: string;
}) => {
  // routing
  const navigate = useNavigate();
  // pagination state
  const [page, setPage] = useState<number>();
  const [rowsPerPage, setRowsPerPage] = useState<number>();
  const [orderByColumn, setOrderByColumn] = useState<string>();
  const [orderDirection, setOrderDirection] = useState<OrderDirection>();
  // filters
  const [searchWord, setSearchWord] = useState<string>();
  const [executionDateRange, setExecutionDateRange] = useState<Date[]>([]);
  const [registrationDateRange, setRegistrationDateRange] = useState<Date[]>([]);
  const [approvedOrRejectedBy, setApprovedOrRejectedBy] = useState<ListItem>();
  const [status, setStatus] = useState<SelectItem<ActivityLogStatus>>();

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
  } = useActivityLogsQuery({
    limit: rowsPerPage as number,
    page: page as number,
    resolutionStatus: resolutionStatus,
    orderBy: orderByColumn,
    volunteerId,
    orderDirection,
    approvedOrRejectedById: approvedOrRejectedBy?.value,
    search: searchWord,
    status: status?.key,
    executionDateStart: executionDateRange[0],
    executionDateEnd: executionDateRange[1],
    registrationDateStart: registrationDateRange[0],
    registrationDateEnd: registrationDateRange[1],
  });
  const { data: counters } = useActivityLogCounterQuery();

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
    navigate('/activity-log/add');
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

  const onExport = () => {
    alert('not yet implemented');
  };

  const onResetFilters = () => {
    setExecutionDateRange([]);
    setRegistrationDateRange([]);
    setStatus(undefined);
    setSearchWord(undefined);
    setApprovedOrRejectedBy(undefined);
  };

  return (
    <>
      <DataTableFilters onSearch={setSearchWord} onResetFilters={onResetFilters}>
        <DateRangePicker
          label={i18n.t('activity_log:filters.execution')}
          onChange={setExecutionDateRange}
          value={executionDateRange.length > 0 ? executionDateRange : undefined}
          id="execution-on-range__picker"
        />
        {resolutionStatus === ActivityLogResolutionStatus.NEW && (
          <DateRangePicker
            label={i18n.t('activity_log:filters.registration')}
            onChange={setRegistrationDateRange}
            value={registrationDateRange.length > 0 ? registrationDateRange : undefined}
            id="registration-on-range__picker"
          />
        )}
        {resolutionStatus === ActivityLogResolutionStatus.SOLVED && (
          <>
            <Select
              label={`${i18n.t('activity_log:status')}`}
              placeholder={`${i18n.t('general:select', { item: '' })}`}
              options={StatusOptions}
              onChange={setStatus}
              selected={status}
            />
            <AdminSelect
              label={i18n.t('activity_log:filters.approved_rejected')}
              onSelect={setApprovedOrRejectedBy}
              defaultValue={approvedOrRejectedBy}
            />
          </>
        )}
      </DataTableFilters>
      <Card>
        <CardHeader>
          <h2>
            {resolutionStatus === ActivityLogResolutionStatus.NEW
              ? i18n.t('activity_log:pending_header', {
                  hours: counters?.pending ?? '-',
                })
              : `${i18n.t('activity_log:past_header', {
                  hours: counters?.approved ?? '-',
                  rejected: counters?.rejected ?? '-',
                })}`}
          </h2>
          {resolutionStatus === ActivityLogResolutionStatus.SOLVED && (
            <div className="flex gap-2 lg:gap-6 flex-wrap">
              <Button
                label={i18n.t('general:download_table')}
                className="btn-outline-secondary grow"
                icon={<ArrowDownTrayIcon className="h-5 w-5 text-cool-gray-600" />}
                onClick={onExport}
                aria-label={`${i18n.t('activity_log:download')}`}
                type="button"
              />
              <Button
                label={i18n.t('activity_log:add')}
                className="btn-primary grow"
                icon={<PlusIcon className="h-5 w-5" />}
                onClick={onAddButtonPress}
                aria-label={`${i18n.t('activity_log:add')}`}
                type="button"
              />
            </div>
          )}
        </CardHeader>
        <CardBody>
          <DataTableComponent
            columns={[
              ...(resolutionStatus === ActivityLogResolutionStatus.NEW
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
    </>
  );
};

export default ActivityLogTable;
