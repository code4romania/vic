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
import { CheckIcon, EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { AnnouncementStatus } from '../common/enums/announcement-status.enum';
import { formatDate, formatDateWithTime } from '../common/utils/utils';
import {
  useAnnouncements,
  useDeleteAnnouncementMutation,
  useUpdateAnnouncementMutation,
} from '../services/announcement/announcement.service';
import { OrderDirection } from '../common/enums/order-direction.enum';
import { useErrorToast, useSuccessToast } from '../hooks/useToast';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { useNavigate } from 'react-router-dom';
import ConfirmationModal from '../components/ConfirmationModal';
import StatusWithMarker from '../components/StatusWithMarker';
import Targets from '../components/Targets';
import DataTableFilters from '../components/DataTableFilters';
import Select, { SelectItem } from '../components/Select';
import TargetsMultiSelect from '../containers/TargetsMultiSelect';

const StatusOptions: SelectItem<AnnouncementStatus>[] = [
  {
    key: AnnouncementStatus.DRAFT,
    value: i18n.t('announcement:status.draft'),
  },
  {
    key: AnnouncementStatus.PUBLISHED,
    value: i18n.t('announcement:status.published'),
  },
];

const StatusMarkerColorMapper = {
  [AnnouncementStatus.PUBLISHED]: 'bg-green-500',
  [AnnouncementStatus.DRAFT]: 'bg-yellow-500',
};

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
    minWidth: '5rem',
    selector: (row: IAnnouncement) => formatDate(row.updatedOn),
  },
  {
    id: 'status',
    name: i18n.t('announcement:header.status'),
    sortable: true,
    grow: 1,
    minWidth: '7rem',
    cell: (row: IAnnouncement) => (
      <CellLayout>
        <StatusWithMarker markerColor={StatusMarkerColorMapper[row.status]}>
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
    selector: (row: IAnnouncement) => formatDateWithTime(row.publishedOn),
  },
  {
    id: 'targetedVolunteers',
    name: i18n.t('announcement:header.target'),
    minWidth: '10rem',
    sortable: true,
    grow: 2,
    cell: (row: IAnnouncement) => (
      <CellLayout>
        <Targets volunteersCount={row.targetedVolunteers} targets={row.targets} />
      </CellLayout>
    ),
  },
];

const Announcements = () => {
  const [page, setPage] = useState<number>();
  const [rowsPerPage, setRowsPerPage] = useState<number>();
  const [orderByColumn, setOrderByColumn] = useState<string>();
  const [orderDirection, setOrderDirection] = useState<OrderDirection>();
  const [selectedIdForDeletion, setSelectedIdForDeletion] = useState<string>();

  // filters
  const [searchWord, setSearchWord] = useState<string>();
  const [status, setStatus] = useState<SelectItem<AnnouncementStatus>>();
  const [targetsIds, setTargetsIds] = useState<SelectItem<string>[]>([]);

  const navigate = useNavigate();

  const {
    data: announcements,
    isLoading: isAnnouncementsLoading,
    error: announcementsError,
    refetch,
  } = useAnnouncements(
    rowsPerPage,
    page,
    orderByColumn,
    orderDirection,
    searchWord,
    status?.key,
    targetsIds.map((targetId) => targetId.key),
  );

  const { mutateAsync: updateAnnouncement, isLoading: isUpdateAnnouncementLoading } =
    useUpdateAnnouncementMutation();

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
    const announcementDraftMenuItems = [
      {
        label: i18n.t('general:view'),
        icon: <EyeIcon className="menu-icon" />,
        onClick: onViewOne,
      },
      {
        label: i18n.t('general:edit', { item: '' }),
        icon: <PencilIcon className="menu-icon" />,
        onClick: onEdit,
      },
      {
        label: i18n.t('general:publish'),
        icon: <CheckIcon className="menu-icon" />,
        onClick: onPublish,
        primary: true,
      },
      {
        label: i18n.t('general:delete', { item: '' }),
        icon: <TrashIcon className="menu-icon" />,
        onClick: onDelete,
        alert: true,
      },
    ];

    const announcementPublishedMenuItems = [
      {
        label: i18n.t('general:view'),
        icon: <EyeIcon className="menu-icon" />,
        onClick: onViewOne,
      },
      {
        label: i18n.t('general:delete', { item: '' }),
        icon: <TrashIcon className="menu-icon" />,
        onClick: onDelete,
        alert: true,
      },
    ];

    return {
      name: '',
      cell: (row: IAnnouncement) => (
        <Popover<IAnnouncement>
          row={row}
          items={
            row.status === AnnouncementStatus.PUBLISHED
              ? announcementPublishedMenuItems
              : announcementDraftMenuItems
          }
        />
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

  const onPublish = (row: IAnnouncement) => {
    updateAnnouncement(
      {
        id: row.id,
        updateData: {
          status: AnnouncementStatus.PUBLISHED,
        },
      },
      {
        onSuccess: () => {
          useSuccessToast(i18n.t('announcement:submit.messages.publish'));
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
  const onChangeRowsPerPage = (rows: number) => {
    setRowsPerPage(rows);
  };

  const onChangePage = (newPage: number) => {
    setPage(newPage);
  };

  const onSort = (column: TableColumn<IAnnouncement>, direction: SortOrder) => {
    setOrderByColumn(column.id as string);
    setOrderDirection(
      direction.toLocaleUpperCase() === OrderDirection.ASC
        ? OrderDirection.ASC
        : OrderDirection.DESC,
    );
  };

  const onResetFilters = () => {
    setSearchWord(undefined);
    setStatus(undefined);
    setTargetsIds([]);
  };

  return (
    <PageLayout>
      <PageHeader>{i18n.t('side_menu:options.announcements')}</PageHeader>
      <DataTableFilters onResetFilters={onResetFilters} onSearch={setSearchWord}>
        <Select
          label={`${i18n.t('general:status')}`}
          onChange={setStatus}
          options={StatusOptions}
          selected={status}
          placeholder={`${i18n.t('general:select', { item: '' })}`}
        />
        <TargetsMultiSelect
          onChange={setTargetsIds}
          selected={targetsIds}
          label={`${i18n.t('announcement:header.target')}`}
          placeholder={`${i18n.t('general:select', { item: '' })}`}
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
            paginationPerPage={announcements?.meta.itemsPerPage}
            paginationTotalRows={announcements?.meta.totalItems}
            paginationDefaultPage={page}
            onChangeRowsPerPage={onChangeRowsPerPage}
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
