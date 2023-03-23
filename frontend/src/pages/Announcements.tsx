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
import { DEFAULT_QUERY_PARAMS, PaginationConfig } from '../common/constants/pagination';
import { ArrayParam, StringParam, useQueryParams } from 'use-query-params';
import StatusSelectFilter from '../containers/StatusSelectFilter';
import TargetsMultiSelectFilter from '../containers/TargetsMultiSelectFilter';

export const ANNOUNCEMENTS_QUERY_PARAMS = {
  ...DEFAULT_QUERY_PARAMS,
  search: StringParam,
  status: StringParam,
  targets: ArrayParam,
};

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
        <Targets targets={row.targets} />
      </CellLayout>
    ),
  },
];

const Announcements = () => {
  const [selectedIdForDeletion, setSelectedIdForDeletion] = useState<string>();

  // filters
  const [targetsIds, setTargetsIds] = useState<SelectItem<string>[]>([]);

  // query params
  const [queryParams, setQueryParams] = useQueryParams(ANNOUNCEMENTS_QUERY_PARAMS);

  const navigate = useNavigate();

  const {
    data: announcements,
    isLoading: isAnnouncementsLoading,
    error: announcementsError,
    refetch,
  } = useAnnouncements(
    queryParams?.limit as number,
    queryParams?.page as number,
    queryParams?.orderBy as string,
    queryParams?.orderDirection as OrderDirection,
    queryParams?.search as string,
    StatusOptions.find((option) => option.value === queryParams?.status)?.key,
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

  // init query
  useEffect(() => {
    // init query params
    setQueryParams({
      limit: queryParams?.limit || PaginationConfig.defaultRowsPerPage,
      page: queryParams?.page || PaginationConfig.defaultPage,
      orderBy: queryParams?.orderBy || 'name',
      orderDirection: queryParams?.orderDirection || OrderDirection.ASC,
    });
  }, []);

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
  const onRowsPerPageChange = (rows: number) => {
    setQueryParams({
      limit: rows,
    });
  };

  const onChangePage = (newPage: number) => {
    setQueryParams({
      page: newPage,
    });
  };

  const onSort = (column: TableColumn<IAnnouncement>, direction: SortOrder) => {
    setQueryParams({
      orderBy: column.id as string,
      orderDirection:
        direction.toLocaleUpperCase() === OrderDirection.ASC
          ? OrderDirection.ASC
          : OrderDirection.DESC,
    });
  };

  const onSearch = (search: string) => {
    setQueryParams({
      search: search || null,
    });
  };

  const onStatusChange = (status: SelectItem<AnnouncementStatus>) => {
    setQueryParams({
      status: status.value || null,
    });
  };

  const onResetFilters = () => {
    setTargetsIds([]);
    setQueryParams({ search: null, targets: null, status: null });
  };

  const onTargetsChange = (selectedTargets: SelectItem<string>[]) => {
    setTargetsIds(selectedTargets || []);
    setQueryParams({
      targets: selectedTargets?.map((item) => item.value) || null,
    });
  };

  return (
    <PageLayout>
      <PageHeader>{i18n.t('side_menu:options.announcements')}</PageHeader>
      <DataTableFilters
        onResetFilters={onResetFilters}
        onSearch={onSearch}
        searchValue={queryParams?.search}
      >
        <StatusSelectFilter
          label={`${i18n.t('general:status')}`}
          onChange={onStatusChange}
          options={StatusOptions}
          selected={queryParams?.status as AnnouncementStatus}
          placeholder={`${i18n.t('general:select', { item: '' })}`}
        />
        <TargetsMultiSelectFilter
          onChange={onTargetsChange}
          selection={targetsIds}
          selectedValues={queryParams?.targets as string[]}
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
            paginationPerPage={announcements?.meta?.itemsPerPage}
            paginationTotalRows={announcements?.meta?.totalItems}
            paginationDefaultPage={queryParams.page as number}
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
