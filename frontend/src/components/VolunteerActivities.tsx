import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { EyeIcon, PlusIcon } from '@heroicons/react/24/outline';
import { TableColumn } from 'react-data-table-component';
import i18n from '../common/config/i18n';
import { ActivityLogSource } from '../common/enums/activity-log-source.enum';
import { OrderDirection } from '../common/enums/order-direction.enum';
import { VolunteerStatus } from '../common/enums/volunteer-status.enum';
import { IActivityLogListItem } from '../common/interfaces/activity-log.interface';
import { ActivityLogStatusMarkerColorMapper, formatDate } from '../common/utils/utils';
import Card from '../layouts/CardLayout';
import CellLayout from '../layouts/CellLayout';
import { useActivityLogsQuery } from '../services/activity-log/activity-log.service';
import ActivityLogSidePanel from './ActivityLogSidePanel';
import Button from './Button';
import CardBody from './CardBody';
import CardHeader from './CardHeader';
import DataTableComponent from './DataTableComponent';
import { ICON_MAPPER, ImageOption } from './ImagePicker';
import StatusWithMarker from './StatusWithMarker';
import Popover from './Popover';

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
        </div>
      </div>
    ),
  },
  {
    id: 'hours',
    name: i18n.t('general:hours'),
    grow: 1,
    minWidth: '5rem',
    cell: (row) => <CellLayout>{`${row.hours}h`}</CellLayout>,
  },
  {
    id: 'date',
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
        <StatusWithMarker markerColor={ActivityLogStatusMarkerColorMapper[row.status]}>
          {i18n.t(`activity_log:display_status.${row.status}`)}
        </StatusWithMarker>
      </CellLayout>
    ),
  },
];

interface VolunteerActivitiesProps {
  volunteerId: string;
  volunteerName?: string;
  volunteerStatus?: VolunteerStatus;
}

// VIC 2.0 (#481): the volunteer's activities, meaning hours logged on an activity type and not on an
// event, in every status. The NGO adds one from here.
const VolunteerActivities = ({
  volunteerId,
  volunteerName,
  volunteerStatus,
}: VolunteerActivitiesProps) => {
  const navigate = useNavigate();
  const [page, setPage] = useState<number>(1);
  const [selected, setSelected] = useState<string>();

  const { data, isLoading, refetch } = useActivityLogsQuery({
    limit: PAGE_SIZE,
    page,
    volunteerId,
    source: ActivityLogSource.ACTIVITY,
    orderBy: 'date',
    orderDirection: OrderDirection.DESC,
  });

  const onAdd = () => {
    const search = new URLSearchParams({
      volunteerId,
      volunteerName: volunteerName ?? '',
      activity: 'true',
    });
    navigate(`/activity-log/add?${search.toString()}`);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col">
            <h2>{i18n.t('volunteer:activities.title')}</h2>
            <small className="text-cool-gray-500">
              {i18n.t('volunteer:activities.description')}
            </small>
          </div>
          <Button
            label={i18n.t('volunteer:activities.add')}
            className="btn-primary"
            icon={<PlusIcon className="h-5 w-5" />}
            onClick={onAdd}
            type="button"
            disabled={volunteerStatus !== VolunteerStatus.ACTIVE}
          />
        </CardHeader>
        <CardBody>
          <DataTableComponent
            columns={[
              ...columns,
              {
                name: '',
                width: '50px',
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

export default VolunteerActivities;
