import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { EyeIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Media, TableColumn } from 'react-data-table-component';
import i18n from '../common/config/i18n';
import { ActivityLogSource } from '../common/enums/activity-log-source.enum';
import { OrderDirection } from '../common/enums/order-direction.enum';
import { VolunteerStatus } from '../common/enums/volunteer-status.enum';
import { IActivityLogListItem } from '../common/interfaces/activity-log.interface';
import { formatDate } from '../common/utils/utils';
import Card from '../layouts/CardLayout';
import CellLayout from '../layouts/CellLayout';
import { useActivityLogsQuery } from '../services/activity-log/activity-log.service';
import ActivityLogSidePanel from './ActivityLogSidePanel';
import Button from './Button';
import CardBody from './CardBody';
import CardHeader from './CardHeader';
import DataTableComponent from './DataTableComponent';
import { ICON_MAPPER, ImageOption } from './ImagePicker';
import StatusBadge, { ACTIVITY_LOG_STATUS_TONE } from './StatusBadge';
import Popover from './Popover';
import { useValidationGate } from '../hooks/useValidationGate';

const PAGE_SIZE = 10;

const columns: TableColumn<IActivityLogListItem>[] = [
  {
    id: 'activityType.name',
    name: i18n.t('activity_log:header.task'),
    grow: 3,
    minWidth: '10rem',
    cell: (row) => (
      <div className="flex items-center gap-3 w-full">
        <ImageOption
          item={row.activityType?.icon || 'package'}
          component={ICON_MAPPER[row.activityType?.icon || 'package']}
        />
        <div className="flex flex-col min-w-0">
          <small className="font-robotoBold truncate">
            {row.activityType?.name || i18n.t('general:other')}
          </small>
          {row.event?.name && (
            <small className="truncate text-cool-gray-500">{row.event.name}</small>
          )}
        </div>
      </div>
    ),
  },
  {
    id: 'hours',
    hide: Media.SM,
    name: i18n.t('general:hours'),
    grow: 1,
    minWidth: '5rem',
    cell: (row) => <CellLayout>{`${row.hours}h`}</CellLayout>,
  },
  {
    id: 'date',
    hide: Media.SM,
    name: i18n.t('activity_log:header.execution_date'),
    grow: 1,
    minWidth: '8rem',
    selector: (row) => formatDate(row.date),
  },
  {
    id: 'status',
    name: i18n.t('activity_log:status'),
    grow: 1,
    minWidth: '8rem',
    cell: (row) => (
      <CellLayout>
        <StatusBadge tone={ACTIVITY_LOG_STATUS_TONE[row.status]}>
          {i18n.t(`activity_log:display_status.${row.status}`)}
        </StatusBadge>
      </CellLayout>
    ),
  },
];

interface VolunteerLogsTableProps {
  volunteerId: string;
  // left out: event and activity hours together
  source?: ActivityLogSource;
  title: string;
  description: string;
  addLabel: string;
  // hidden when the volunteer cannot get hours (only Active can)
  canAdd: boolean;
  onAdd: () => void;
}

// VIC 2.0 (#481, #482): a volunteer's logged hours in every status (approved, pending, rejected).
// The Activities tab shows only hours with no event; the hours history shows all of them.
export const VolunteerLogsTable = ({
  volunteerId,
  source,
  title,
  description,
  addLabel,
  canAdd,
  onAdd,
}: VolunteerLogsTableProps) => {
  // logging hours needs a validated organization (decision 1)
  const { gate } = useValidationGate();
  const [page, setPage] = useState<number>(1);
  const [selected, setSelected] = useState<string>();

  const { data, isLoading, error, refetch } = useActivityLogsQuery({
    limit: PAGE_SIZE,
    page,
    volunteerId,
    source,
    orderBy: 'date',
    orderDirection: OrderDirection.DESC,
  });

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col">
            <h2>{title}</h2>
            <small className="text-cool-gray-500">{description}</small>
          </div>
          {canAdd && (
            <Button
              label={addLabel}
              className="btn-primary"
              icon={<PlusIcon className="h-5 w-5" />}
              onClick={onAdd}
              type="button"
              {...gate}
            />
          )}
        </CardHeader>
        <CardBody>
          <DataTableComponent
            columns={[
              ...columns,
              {
                name: '',
                width: '64px',
                allowOverflow: true,
                cell: (row: IActivityLogListItem) => (
                  <Popover<IActivityLogListItem>
                    row={row}
                    items={[
                      {
                        label: i18n.t('activity_log:popover.view'),
                        icon: <EyeIcon className="menu-icon" />,
                        onClick: (item: IActivityLogListItem) => setSelected(item.id),
                      },
                    ]}
                  />
                ),
              },
            ]}
            data={data?.items}
            loading={isLoading}
            error={error}
            onRetry={refetch}
            pagination
            paginationPerPage={PAGE_SIZE}
            paginationTotalRows={data?.meta?.totalItems}
            paginationDefaultPage={page}
            onChangePage={setPage}
          />
        </CardBody>
      </Card>
      <ActivityLogSidePanel
        isOpen={!!selected}
        activityLogId={selected}
        onClose={(shouldRefetch) => {
          setSelected(undefined);
          if (shouldRefetch) refetch();
        }}
      />
    </>
  );
};

interface VolunteerActivitiesProps {
  volunteerId: string;
  volunteerName?: string;
  volunteerStatus?: VolunteerStatus;
}

// #481: the volunteer's activities, meaning hours logged on an activity type and not on an event.
const VolunteerActivities = ({
  volunteerId,
  volunteerName,
  volunteerStatus,
}: VolunteerActivitiesProps) => {
  const navigate = useNavigate();

  const onAdd = () => {
    const search = new URLSearchParams({
      volunteerId,
      volunteerName: volunteerName ?? '',
      activity: 'true',
    });
    navigate(`/activity-log/add?${search.toString()}`);
  };

  return (
    <VolunteerLogsTable
      volunteerId={volunteerId}
      source={ActivityLogSource.ACTIVITY}
      title={i18n.t('volunteer:activities.title')}
      description={i18n.t('volunteer:activities.description')}
      addLabel={i18n.t('volunteer:activities.add')}
      canAdd={volunteerStatus === VolunteerStatus.ACTIVE}
      onAdd={onAdd}
    />
  );
};

export default VolunteerActivities;
