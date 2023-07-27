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
import {
  ActivityLogStatusMarkerColorMapper,
  downloadExcel,
  formatDate,
} from '../common/utils/utils';
import { useErrorToast } from '../hooks/useToast';
import { InternalErrors } from '../common/errors/internal-errors.class';
import MediaCell from './MediaCell';
import {
  useActivityLogCounterQuery,
  useActivityLogsQuery,
} from '../services/activity-log/activity-log.service';
import { IActivityLogListItem } from '../common/interfaces/activity-log.interface';
import CellLayout from '../layouts/CellLayout';
import StatusWithMarker from './StatusWithMarker';
import { useNavigate } from 'react-router';
import ActivityLogSidePanel from './ActivityLogSidePanel';
import DataTableFilters from './DataTableFilters';
import DateRangePicker from './DateRangePicker';
import { ActivityLogStatus } from '../common/enums/activity-log.status.enum';
import { ActivityLogResolutionStatus } from '../common/enums/activity-log-resolution-status.enum';
import Button from './Button';
import AdminSelect from '../containers/AdminSelect';
import { ListItem } from '../common/interfaces/list-item.interface';
import { getActivityLogsForDownload } from '../services/activity-log/activity-log.api';
import { ActivityLogTableBasicProps } from '../containers/query/ActivityLogTableWithQueryParams';
import LinkCell from './LinkCell';
import { VolunteerStatus } from '../common/enums/volunteer-status.enum';

const StatusOptions: SelectItem<ActivityLogStatus>[] = [
  { key: ActivityLogStatus.APPROVED, value: i18n.t('activity_log:display_status.approved') },
  { key: ActivityLogStatus.REJECTED, value: i18n.t('activity_log:display_status.rejected') },
];

const PendingVolunteerActivityLogTableHeader = [
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
    cell: (row: IActivityLogListItem) => <CellLayout>{`${row.hours}h`}</CellLayout>,
  },
  {
    id: 'date',
    name: i18n.t('activity_log:header.execution_date'),
    sortable: true,
    grow: 1,
    minWidth: '8rem',
    selector: (row: IActivityLogListItem) => formatDate(row?.date),
  },
  {
    id: 'createdOn',
    name: i18n.t('activity_log:header.registration_date'),
    sortable: true,
    grow: 1,
    minWidth: '8rem',
    selector: (row: IActivityLogListItem) => formatDate(row.createdOn),
  },
];

const PastVolunteerActivityLogTableHeader = [
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
    cell: (row: IActivityLogListItem) => <CellLayout>{`${row.hours}h`}</CellLayout>,
  },
  {
    id: 'date',
    name: i18n.t('activity_log:header.execution_date'),
    sortable: true,
    grow: 1,
    minWidth: '8rem',
    selector: (row: IActivityLogListItem) => formatDate(row.date),
  },
  {
    id: 'status',
    name: i18n.t('activity_log:status'),
    sortable: true,
    grow: 1,
    minWidth: '8rem',
    cell: (row: IActivityLogListItem) => (
      <CellLayout>
        <StatusWithMarker markerColor={ActivityLogStatusMarkerColorMapper[row.status]}>
          {i18n.t(`activity_log:display_status.${row.status}`)}
        </StatusWithMarker>
      </CellLayout>
    ),
  },
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
    cell: (row: IActivityLogListItem) => <CellLayout>{`${row.hours}h`}</CellLayout>,
  },
  {
    id: 'date',
    name: i18n.t('activity_log:header.execution_date'),
    sortable: true,
    grow: 1,
    minWidth: '8rem',
    cell: (row: IActivityLogListItem) => <CellLayout>{formatDate(row?.date)}</CellLayout>,
  },
  {
    id: 'user.name',
    name: i18n.t('volunteer:name', { status: '' }),
    sortable: true,
    grow: 1,
    minWidth: '10rem',
    cell: (row: IActivityLogListItem) =>
      row.volunteer && (
        <LinkCell href={`/volunteers/${row.volunteer.id}`}>{row.volunteer.name}</LinkCell>
      ),
  },
  {
    id: 'createdOn',
    name: i18n.t('activity_log:header.registration_date'),
    sortable: true,
    grow: 1,
    minWidth: '8rem',
    cell: (row: IActivityLogListItem) => <CellLayout>{formatDate(row.createdOn)}</CellLayout>,
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
    cell: (row: IActivityLogListItem) => <CellLayout>{`${row.hours}h`}</CellLayout>,
  },
  {
    id: 'date',
    name: i18n.t('activity_log:header.execution_date'),
    sortable: true,
    grow: 1,
    minWidth: '8rem',
    cell: (row: IActivityLogListItem) => <CellLayout>{formatDate(row.date)}</CellLayout>,
  },
  {
    id: 'user.name',
    name: i18n.t('volunteer:name', { status: '' }),
    sortable: true,
    grow: 1,
    minWidth: '10rem',
    cell: (row: IActivityLogListItem) =>
      row.volunteer && (
        <LinkCell href={`/volunteers/${row.volunteer.id}`}>{row.volunteer.name}</LinkCell>
      ),
  },
  {
    id: 'status',
    name: i18n.t('activity_log:status'),
    sortable: true,
    grow: 1,
    minWidth: '8rem',
    cell: (row: IActivityLogListItem) => (
      <CellLayout>
        <StatusWithMarker markerColor={ActivityLogStatusMarkerColorMapper[row.status]}>
          {i18n.t(`activity_log:display_status.${row.status}`)}
        </StatusWithMarker>
      </CellLayout>
    ),
  },
];

interface ActivityLogTableProps extends ActivityLogTableBasicProps {
  resolutionStatus: ActivityLogResolutionStatus;
  volunteerId?: string;
  volunteerStatus?: VolunteerStatus;
  volunteerName?: string;
}

const ActivityLogTable = ({
  resolutionStatus,
  volunteerId,
  volunteerStatus,
  volunteerName,
  query,
  setQuery,
}: ActivityLogTableProps) => {
  // routing
  const navigate = useNavigate();
  // filters
  const [approvedOrRejectedBy, setApprovedOrRejectedBy] = useState<ListItem>();
  const [status, setStatus] = useState<SelectItem<ActivityLogStatus>>();

  // selected activity log id
  const [selectedActivityLog, setSelectedActivityLog] = useState<string>();
  // side panel state
  const [isViewActivityLogSidePanelOpen, setIsViewActivityLogSidePanelOpen] =
    useState<boolean>(false);

  // get all query
  const {
    data: activityLogs,
    isLoading: isActivityLogsLoading,
    error: activityLogsError,
    refetch,
  } = useActivityLogsQuery({
    limit: query.limit as number,
    page: query.page as number,
    resolutionStatus: query.resolutionStatus as ActivityLogResolutionStatus,
    orderBy: query.orderBy,
    volunteerId,
    orderDirection: query.orderDirection as OrderDirection,
    approvedOrRejectedBy: query.approvedOrRejectedBy,
    search: query.search,
    status: query.status,
    executionDateStart: query.executionDateStart,
    executionDateEnd: query.executionDateEnd,
    registrationDateStart: query.registrationDateStart,
    registrationDateEnd: query.registrationDateEnd,
  });
  const { data: counters, refetch: reloadCounters } = useActivityLogCounterQuery(volunteerId);

  // query error handling
  useEffect(() => {
    if (activityLogsError)
      useErrorToast(
        InternalErrors.ACTIVITY_LOG_ERRORS.getError(activityLogsError.response?.data.code_error),
      );
  }, [activityLogsError]);

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

  const buildActivityLogTableHeader = (): TableColumn<IActivityLogListItem>[] => {
    if (resolutionStatus === ActivityLogResolutionStatus.NEW && volunteerId) {
      return PendingVolunteerActivityLogTableHeader;
    } else if (resolutionStatus === ActivityLogResolutionStatus.SOLVED && volunteerId) {
      return PastVolunteerActivityLogTableHeader;
    } else if (resolutionStatus === ActivityLogResolutionStatus.NEW) {
      return PendingActivityLogTableHeader;
    }
    return PastActivityLogTableHeader;
  };

  const onAddButtonPress = () => {
    navigate(`/activity-log/add?volunteerName=${volunteerName}&volunteerId=${volunteerId}`);
  };

  const onView = (row: IActivityLogListItem) => {
    setSelectedActivityLog(row.id);
    setIsViewActivityLogSidePanelOpen(true);
  };

  const onCloseSidePanel = (shouldRefetch?: boolean) => {
    setIsViewActivityLogSidePanelOpen(false);
    setSelectedActivityLog(undefined);
    if (shouldRefetch) {
      refetch();
      reloadCounters();
    }
  };

  // pagination
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

  const onSort = (column: TableColumn<IActivityLogListItem>, direction: SortOrder) => {
    setQuery({
      orderBy: column.id as string,
      orderDirection:
        direction.toLocaleUpperCase() === OrderDirection.ASC
          ? OrderDirection.ASC
          : OrderDirection.DESC,
    });
  };

  const onSearch = (search: string) => {
    setQuery({
      search,
    });
  };

  const onStatusChange = (status: SelectItem<ActivityLogStatus>) => {
    setStatus(status);
    setQuery({ status: status.key });
  };

  const onExecutionOnRangeChange = ([executionDateStart, executionDateEnd]: Date[]) => {
    setQuery({
      executionDateStart,
      executionDateEnd,
    });
  };

  const onRegistrationOnRangeChange = ([registrationDateStart, registrationDateEnd]: Date[]) => {
    setQuery({
      registrationDateStart,
      registrationDateEnd,
    });
  };

  const onApprovedOrRejectedByChange = (admin: ListItem) => {
    setApprovedOrRejectedBy(admin);
    setQuery({ approvedOrRejectedBy: admin.label });
  };

  const onExport = async () => {
    const { data: activityLogsData } = await getActivityLogsForDownload({
      limit: query.limit as number,
      page: query.page as number,
      resolutionStatus,
      orderBy: query.orderBy,
      orderDirection: query.orderDirection as OrderDirection,
      search: query.search,
      status: query.status,
      approvedOrRejectedBy: query.approvedOrRejectedBy,
      executionDateStart: query.executionDateStart,
      executionDateEnd: query.executionDateEnd,
      volunteerId: volunteerId,
    });

    downloadExcel(activityLogsData as BlobPart, i18n.t('activity_log:download_file_name'));
  };

  const onResetFilters = () => {
    setStatus(undefined);
    setApprovedOrRejectedBy(undefined);
    if (volunteerId) {
      setQuery({ activeTab: query.activeTab }, 'push');
    } else {
      setQuery({ resolutionStatus: query.resolutionStatus }, 'push');
    }
  };

  return (
    <>
      <DataTableFilters
        onSearch={onSearch}
        searchValue={query?.search}
        onResetFilters={onResetFilters}
      >
        <DateRangePicker
          label={i18n.t('activity_log:filters.execution')}
          onChange={onExecutionOnRangeChange}
          value={
            query?.executionDateStart && query?.executionDateEnd
              ? [query?.executionDateStart, query?.executionDateEnd]
              : undefined
          }
          id="execution-on-range__picker"
        />
        {resolutionStatus === ActivityLogResolutionStatus.NEW && (
          <DateRangePicker
            label={i18n.t('activity_log:filters.registration')}
            onChange={onRegistrationOnRangeChange}
            value={
              query?.registrationDateStart && query?.registrationDateEnd
                ? [query?.registrationDateStart, query?.registrationDateEnd]
                : undefined
            }
            id="registration-on-range__picker"
          />
        )}
        {resolutionStatus === ActivityLogResolutionStatus.SOLVED && (
          <>
            <Select
              label={`${i18n.t('activity_log:status')}`}
              placeholder={`${i18n.t('general:select', { item: '' })}`}
              options={StatusOptions}
              onChange={onStatusChange}
              selected={
                query.status ? StatusOptions.find((option) => option.key === query.status) : status
              }
            />
            <AdminSelect
              label={i18n.t('activity_log:filters.approved_rejected')}
              onSelect={onApprovedOrRejectedByChange}
              defaultValue={
                query.approvedOrRejectedBy
                  ? { value: '', label: query.approvedOrRejectedBy }
                  : approvedOrRejectedBy
              }
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
                aria-label={`${i18n.t('general:download_table')}`}
                type="button"
              />
              {volunteerId && (
                <Button
                  label={i18n.t('activity_log:add')}
                  className="btn-primary grow"
                  icon={<PlusIcon className="h-5 w-5" />}
                  onClick={onAddButtonPress}
                  aria-label={`${i18n.t('activity_log:add')}`}
                  type="button"
                  disabled={volunteerStatus !== VolunteerStatus.ACTIVE}
                />
              )}
            </div>
          )}
        </CardHeader>
        <CardBody>
          <DataTableComponent
            columns={[...buildActivityLogTableHeader(), buildActivityLogActionColumn()]}
            data={activityLogs?.items}
            loading={isActivityLogsLoading}
            pagination
            paginationPerPage={query.limit}
            paginationTotalRows={activityLogs?.meta?.totalItems}
            paginationDefaultPage={query.page}
            onChangeRowsPerPage={onRowsPerPageChange}
            onChangePage={onChangePage}
            onSort={onSort}
          />
        </CardBody>
      </Card>
      <ActivityLogSidePanel
        onClose={onCloseSidePanel}
        isOpen={isViewActivityLogSidePanelOpen}
        activityLogId={selectedActivityLog}
      />
    </>
  );
};

export default ActivityLogTable;
