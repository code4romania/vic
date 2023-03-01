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
  useAnnouncementQuery,
  useAnnouncementsQuery,
  useDeleteAnnouncementMutation,
  useUpdateAnnouncementMutation,
} from '../services/announcement/announcement.service';
import { OrderDirection } from '../common/enums/order-direction.enum';
import { useErrorToast, useSuccessToast } from '../hooks/useToast';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { useNavigate, useParams } from 'react-router-dom';
import ConfirmationModal from '../components/ConfirmationModal';

const mapTargetsToString = (announcement: IAnnouncement) => {
  return `(${announcement.targetedVolunteers}) ${announcement.targets.map(
    (target) => ` ${target.name}`,
  )}`;
};

const AnnouncementTableHeader = [
  {
    id: 'name',
    name: i18n.t('announcement:header.name'),
    sortable: true,
    minWidth: '10rem',
    selector: (row: IAnnouncement) => row.name,
  },
  {
    id: 'updatedOn',
    name: i18n.t('announcement:header.updated_on'),
    sortable: true,
    minWidth: '5rem',
    selector: (row: IAnnouncement) => formatDate(row.updatedOn),
  },
  {
    id: 'status',
    name: i18n.t('announcement:header.status'),
    sortable: true,
    minWidth: '2rem',
    cell: (row: IAnnouncement) => (
      <CellLayout>
        <div className="flex flex-row gap-2">
          <span
            className={`h-2 w-2 border-solid ${
              row.status === AnnouncementStatus.PUBLISHED ? 'bg-green-500' : 'bg-yellow-500'
            } rounded-full self-center`}
          />
          <p>{i18n.t(`announcement:status.${row.status}`)}</p>
        </div>
      </CellLayout>
    ),
  },
  {
    id: 'publishedOn',
    name: i18n.t('announcement:header.published_on'),
    sortable: true,
    minWidth: '5rem',
    selector: (row: IAnnouncement) => formatDateWithTime(row.publishedOn).slice(0, 17),
  },
  {
    id: 'targets',
    name: i18n.t('announcement:header.target'),
    minWidth: '10rem',
    cell: (row: IAnnouncement) => (
      <CellLayout>
        {row.targets.length !== 0 ? (
          <p title={mapTargetsToString(row)} className="text-overflow">
            {mapTargetsToString(row)}
          </p>
        ) : (
          <p>
            ({row.targetedVolunteers}) {i18n.t('announcement:all_organization')}
          </p>
        )}
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

  const navigate = useNavigate();
  const { id } = useParams();

  const { data: announcement, isLoading: isAnnouncementLoading } = useAnnouncementQuery(
    id as string,
  );
  const {
    data: announcements,
    isLoading: isAnnouncementsLoading,
    error: announcementsError,
    refetch,
  } = useAnnouncementsQuery(rowsPerPage as number, page as number, orderByColumn, orderDirection);
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
        label: i18n.t('announcement:publish'),
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

  const onViewOne = (row: IAnnouncement) => {
    alert(`Not yet implemented, ${row.name}`);
  };

  const onPublish = () => {
    if (announcement) {
      updateAnnouncement(
        {
          id: announcement?.id,
          updateData: {
            status: AnnouncementStatus.PUBLISHED,
          },
        },
        {
          onSuccess: () => {
            useSuccessToast(i18n.t('announcement:success.create_publish'));
            refetch();
          },
          onError: (error) => {
            useErrorToast(
              InternalErrors.ANNOUNCEMENT_ERRORS.getError(error.response?.data.code_error),
            );
          },
        },
      );
    }
  };

  const onEdit = (row: IAnnouncement) => {
    navigate(`${row.id}/edit`);
  };

  const onDelete = (row: IAnnouncement) => {
    setSelectedIdForDeletion(row.id);
  };

  const onDeleteAnnouncement = () => {
    if (selectedIdForDeletion) {
      deleteAnnouncement(selectedIdForDeletion, {
        onSuccess: () => {
          useSuccessToast(i18n.t('announcement:success.delete'));
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

  return (
    <PageLayout>
      <PageHeader>{i18n.t('side_menu:options.announcements')}</PageHeader>
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
              isAnnouncementsLoading ||
              isAnnouncementLoading ||
              isUpdateAnnouncementLoading ||
              isDeleteAnnouncementLoading
            }
            paginationPerPage={announcements?.meta.itemsPerPage}
            paginationTotalRows={announcements?.meta.totalItems}
            paginationDefaultPage={page}
            onChangeRowsPerPage={onChangeRowsPerPage}
            onChangePage={onChangePage}
            onSort={onSort}
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
