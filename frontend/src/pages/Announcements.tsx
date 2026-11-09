import React, { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader';
import PageLayout from '../layouts/PageLayout';
import i18n from '../common/config/i18n';
import CardHeader from '../components/CardHeader';
import Card from '../layouts/CardLayout';
import CardBody from '../components/CardBody';
import Button from '../components/Button';
import { PlusIcon } from '@heroicons/react/24/solid';
import DataTableComponent from '../components/DataTableComponent';
import { IAnnouncement } from '../common/interfaces/announcement.interface';
import CellLayout from '../layouts/CellLayout';
import { SortOrder, TableColumn } from 'react-data-table-component';
import Popover from '../components/Popover';
import {
  ArchiveBoxIcon,
  CheckIcon,
  EyeIcon,
  PauseIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { AnnouncementStatus, AnnouncementType } from '../common/enums/announcement-status.enum';
import {
  AnouncementStatusMarkerColorMapper,
  formatDate,
  formatDateWithTime,
} from '../common/utils/utils';
import {
  useAnnouncements,
  useDeleteAnnouncementMutation,
  useChangeAnnouncementStatusMutation,
} from '../services/announcement/announcement.service';
import { AnnouncementStatusAction } from '../services/announcement/announcement.api';
import { OrderDirection } from '../common/enums/order-direction.enum';
import { useErrorToast, useSuccessToast } from '../hooks/useToast';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { useNavigate } from 'react-router-dom';
import ConfirmationModal from '../components/ConfirmationModal';
import StatusWithMarker from '../components/StatusWithMarker';
import DataTableFilters from '../components/DataTableFilters';
import { SelectItem } from '../components/Select';
import { AnnouncementsProps } from '../containers/query/AnnouncementsWithQueryParms';
import SelectFilter from '../containers/SelectFilter';

const StatusOptions: SelectItem<AnnouncementStatus>[] = Object.values(AnnouncementStatus).map(
  (status) => ({ key: status, value: i18n.t(`announcement:status.${status}`) }),
);

const TypeOptions: SelectItem<AnnouncementType>[] = Object.values(AnnouncementType).map((type) => ({
  key: type,
  value: i18n.t(`announcement:type.${type}`),
}));

const formatDisplayPeriod = (row: IAnnouncement): string =>
  `${formatDate(row.displayStartDate)} - ${
    row.displayEndDate ? formatDate(row.displayEndDate) : i18n.t('announcement:no_end')
  }`;

const AnnouncementTableHeader = [
  {
    id: 'name',
    name: i18n.t('announcement:header.name'),
    sortable: true,
    grow: 3,
    minWidth: '15rem',
    cell: (row: IAnnouncement) => (
      <CellLayout>
        <small className="font-robotoBold text-overflow">{row.name}</small>
      </CellLayout>
    ),
  },
  {
    id: 'updatedOn',
    name: i18n.t('announcement:header.updated_on'),
    sortable: true,
    grow: 1,
    minWidth: '8rem',
    cell: (row: IAnnouncement) => <CellLayout>{formatDate(row.updatedOn)}</CellLayout>,
  },
  {
    id: 'status',
    name: i18n.t('announcement:header.status'),
    sortable: true,
    grow: 1,
    minWidth: '7rem',
    cell: (row: IAnnouncement) => (
      <CellLayout>
        <StatusWithMarker markerColor={AnouncementStatusMarkerColorMapper[row.status]}>
          {i18n.t(`announcement:status.${row.status}`)}
        </StatusWithMarker>
      </CellLayout>
    ),
  },
  {
    id: 'publishedOn',
    name: i18n.t('announcement:header.published_on'),
    sortable: true,
    grow: 1,
    minWidth: '10rem',
    cell: (row: IAnnouncement) => <CellLayout>{formatDateWithTime(row.publishedOn)}</CellLayout>,
  },
  {
    id: 'type',
    name: i18n.t('announcement:header.type'),
    sortable: true,
    grow: 1,
    minWidth: '9rem',
    cell: (row: IAnnouncement) => (
      <CellLayout>{i18n.t(`announcement:type.${row.type}`)}</CellLayout>
    ),
  },
  {
    id: 'volunteersNeeded',
    name: i18n.t('announcement:header.volunteers_needed'),
    sortable: true,
    grow: 1,
    minWidth: '7rem',
    cell: (row: IAnnouncement) => <CellLayout>{row.volunteersNeeded ?? '-'}</CellLayout>,
  },
  {
    id: 'displayStartDate',
    name: i18n.t('announcement:header.display_period'),
    sortable: true,
    grow: 2,
    minWidth: '12rem',
    cell: (row: IAnnouncement) => <CellLayout>{formatDisplayPeriod(row)}</CellLayout>,
  },
];

const Announcements = ({ query, setQuery }: AnnouncementsProps) => {
  const [selectedIdForDeletion, setSelectedIdForDeletion] = useState<string>();

  const navigate = useNavigate();

  const {
    data: announcements,
    isLoading: isAnnouncementsLoading,
    error: announcementsError,
    refetch,
  } = useAnnouncements(
    query.limit as number,
    query.page as number,
    query.orderBy as string,
    query.orderDirection as OrderDirection,
    query.search,
    query?.status as AnnouncementStatus,
    query?.type as AnnouncementType,
  );

  const { mutateAsync: changeStatus, isLoading: isUpdateAnnouncementLoading } =
    useChangeAnnouncementStatusMutation();

  const { mutateAsync: deleteAnnouncement, isLoading: isDeleteAnnouncementLoading } =
    useDeleteAnnouncementMutation();

  useEffect(() => {
    if (announcementsError) {
      useErrorToast(
        InternalErrors.ANNOUNCEMENT_ERRORS.getError(announcementsError.response?.data.code_error),
      );
    }
  }, [announcementsError]);

  const buildAnnouncementActionColumn = (): TableColumn<IAnnouncement> => {
    const view = {
      label: i18n.t('general:view'),
      icon: <EyeIcon className="menu-icon" />,
      onClick: onViewOne,
    };
    const edit = {
      label: i18n.t('general:edit', { item: '' }),
      icon: <PencilIcon className="menu-icon" />,
      onClick: onEdit,
    };
    const activate = {
      label: i18n.t('announcement:actions.activate'),
      icon: <CheckIcon className="menu-icon" />,
      onClick: (row: IAnnouncement) => onChangeStatus(row, 'activate'),
      primary: true,
    };
    const deactivate = {
      label: i18n.t('announcement:actions.deactivate'),
      icon: <PauseIcon className="menu-icon" />,
      onClick: (row: IAnnouncement) => onChangeStatus(row, 'deactivate'),
    };
    const archive = {
      label: i18n.t('announcement:actions.archive'),
      icon: <ArchiveBoxIcon className="menu-icon" />,
      onClick: (row: IAnnouncement) => onChangeStatus(row, 'archive'),
    };
    const remove = {
      label: i18n.t('general:delete', { item: '' }),
      icon: <TrashIcon className="menu-icon" />,
      onClick: onDelete,
      alert: true,
    };

    const menuItemsByStatus = {
      [AnnouncementStatus.ACTIVE]: [view, edit, deactivate, archive, remove],
      [AnnouncementStatus.INACTIVE]: [view, edit, activate, archive, remove],
      [AnnouncementStatus.ARCHIVED]: [view, remove],
    };

    return {
      name: '',
      cell: (row: IAnnouncement) => (
        <Popover<IAnnouncement> row={row} items={menuItemsByStatus[row.status] || [view]} />
      ),
      width: '50px',
      allowOverflow: true,
    };
  };

  const onAdd = () => {
    navigate('add');
  };

  const onEdit = (row: IAnnouncement) => {
    navigate(`${row.id}/edit`);
  };

  const onViewOne = (row: IAnnouncement) => {
    navigate(`${row.id}`);
  };

  const onChangeStatus = (row: IAnnouncement, action: AnnouncementStatusAction) => {
    changeStatus(
      { id: row.id, action },
      {
        onSuccess: () => {
          useSuccessToast(i18n.t(`announcement:submit.messages.${action}`));
          refetch();
        },
        onError: (error) => {
          useErrorToast(
            InternalErrors.ANNOUNCEMENT_ERRORS.getError(error.response?.data.code_error),
          );
        },
      },
    );
  };

  const onDelete = (row: IAnnouncement) => {
    setSelectedIdForDeletion(row.id);
  };

  const onDeleteAnnouncement = () => {
    if (selectedIdForDeletion) {
      deleteAnnouncement(selectedIdForDeletion, {
        onSuccess: () => {
          useSuccessToast(i18n.t('announcement:submit.messages.delete'));
          refetch();
        },
        onError: (error) => {
          useErrorToast(
            InternalErrors.ANNOUNCEMENT_ERRORS.getError(error.response?.data.code_error),
          );
        },
        onSettled: () => {
          setSelectedIdForDeletion(undefined);
        },
      });
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
    setQuery({ page });
  };

  const onSearch = (search: string) => {
    setQuery({
      search,
    });
  };

  const onStatusChange = (status: SelectItem<string> | undefined) => {
    setQuery({
      status: status?.key,
    });
  };

  const onTypeChange = (type: SelectItem<string> | undefined) => {
    setQuery({
      type: type?.key,
    });
  };

  const onSort = (column: TableColumn<IAnnouncement>, direction: SortOrder) => {
    setQuery({
      orderBy: column.id as string,
      orderDirection:
        direction.toLocaleUpperCase() === OrderDirection.ASC
          ? OrderDirection.ASC
          : OrderDirection.DESC,
    });
  };

  const onResetFilters = () => {
    setQuery({}, 'push');
  };

  return (
    <PageLayout>
      <PageHeader>{i18n.t('side_menu:options.announcements')}</PageHeader>
      <DataTableFilters
        onResetFilters={onResetFilters}
        onSearch={onSearch}
        searchValue={query?.search}
      >
        <SelectFilter
          label={`${i18n.t('general:status')}`}
          onChange={onStatusChange}
          options={StatusOptions}
          defaultValue={query.status}
          placeholder={`${i18n.t('general:select', { item: '' })}`}
          allowDeselect
        />
        <SelectFilter
          label={`${i18n.t('announcement:header.type')}`}
          onChange={onTypeChange}
          options={TypeOptions}
          defaultValue={query.type}
          placeholder={`${i18n.t('general:select', { item: '' })}`}
          allowDeselect
        />
      </DataTableFilters>
      <Card>
        <CardHeader>
          <h3>{i18n.t('announcement:title')}</h3>
          <Button
            icon={<PlusIcon className="h-5 w-5" />}
            className="btn-primary"
            label={i18n.t('general:add', { item: i18n.t('announcement:name') })}
            onClick={onAdd}
          />
        </CardHeader>
        <CardBody>
          <DataTableComponent<IAnnouncement>
            columns={[...AnnouncementTableHeader, buildAnnouncementActionColumn()]}
            data={announcements?.items}
            pagination
            loading={
              isAnnouncementsLoading || isUpdateAnnouncementLoading || isDeleteAnnouncementLoading
            }
            paginationPerPage={query.limit}
            paginationTotalRows={announcements?.meta.totalItems}
            paginationDefaultPage={query.page as number}
            onChangeRowsPerPage={onRowsPerPageChange}
            onChangePage={onChangePage}
            onSort={onSort}
            defaultSortAsc={false}
          />
        </CardBody>
      </Card>
      {selectedIdForDeletion && (
        <ConfirmationModal
          title={i18n.t('announcement:modal.title')}
          description={i18n.t('announcement:modal.description')}
          confirmBtnLabel={i18n.t('general:delete')}
          confirmBtnClassName="btn-danger"
          onClose={setSelectedIdForDeletion.bind(null, undefined)}
          onConfirm={onDeleteAnnouncement}
        />
      )}
    </PageLayout>
  );
};

export default Announcements;
