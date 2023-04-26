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
import {
  AnouncementStatusMarkerColorMapper,
  formatDate,
  formatDateWithTime,
} from '../common/utils/utils';
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
import { SelectItem } from '../components/Select';
import { AnnouncementsProps } from '../containers/query/AnnouncementsWithQueryParms';
import SelectFilter from '../containers/SelectFilter';
import TargetsMultiSelectFilter from '../containers/TargetsMultiSelectFilter';

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
    id: 'targetedVolunteers',
    name: i18n.t('announcement:header.target'),
    minWidth: '10rem',
    sortable: true,
    grow: 2,
    cell: (row: IAnnouncement) => (
      <CellLayout>
        <Targets targets={row.targets} targetedMembers={row.targetedVolunteers} />
      </CellLayout>
    ),
  },
];

const Announcements = ({ query, setQuery }: AnnouncementsProps) => {
  const [selectedIdForDeletion, setSelectedIdForDeletion] = useState<string>();

  // filters
  const [targets, setTargets] = useState<SelectItem<string>[]>([]);

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
    query?.targets,
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

  const onStatusChange = (status: SelectItem<string>) => {
    setQuery({
      status: status.key,
    });
  };

  const onTargetsChange = (targets: SelectItem<string>[]) => {
    setTargets(targets);
    setQuery({
      targets: targets.map((target) => target.value),
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
    setTargets([]);
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
        />
        <TargetsMultiSelectFilter
          onChange={onTargetsChange}
          selected={targets}
          label={`${i18n.t('announcement:header.target')}`}
          defaultValues={query?.targets}
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
