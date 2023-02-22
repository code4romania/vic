import React, { useEffect, useState } from 'react';
import PageLayout from '../layouts/PageLayout';
import Card from '../layouts/CardLayout';
import CardHeader from '../components/CardHeader';
import CardBody from '../components/CardBody';
import Button from '../components/Button';
import Tabs from '../components/Tabs';
import DataTableComponent from '../components/DataTableComponent';
import i18n from '../common/config/i18n';
import {
  ArrowDownTrayIcon,
  EyeIcon,
  XMarkIcon,
  PauseCircleIcon,
  NoSymbolIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { SortOrder, TableColumn } from 'react-data-table-component';
import Popover from '../components/Popover';
import { OrderDirection } from '../common/enums/order-direction.enum';
import { SelectItem } from '../components/Select';
import { PaginationConfig } from '../common/constants/pagination';
import { formatDate } from '../common/utils/utils';
import { useErrorToast } from '../hooks/useToast';
import { InternalErrors } from '../common/errors/internal-errors.class';
import MediaCell from '../components/MediaCell';
import { useVolunteersQuery } from '../services/volunteer/volunteer.service';
import PageHeader from '../components/PageHeader';
import { IVolunteer } from '../common/interfaces/volunteer.interface';
import { VolunteerStatus } from '../common/enums/volunteer-status.enum';

const VolunteersTabs: SelectItem<VolunteerStatus>[] = [
  { key: VolunteerStatus.ACTIVE, value: i18n.t('volunteers:tabs.active') },
  { key: VolunteerStatus.ARCHIVED, value: i18n.t('volunteers:tabs.archived') },
  { key: VolunteerStatus.BLOCKED, value: i18n.t('volunteers:tabs.blocked') },
];

const ActiveVolunteersTableHeader = [
  {
    id: 'name',
    name: i18n.t('general:name'),
    sortable: true,
    cell: (row: IVolunteer) => (
      <MediaCell
        logo={row.createdBy?.profilePicture || ''}
        title={row.createdBy.name}
        subtitle={'Voluntar Iasi'} // TODO: TBD
      />
    ),
  },
  {
    id: 'department',
    name: i18n.t('volunteers:department_and_role'),
    sortable: true,
    selector: (row: IVolunteer) => `${row.role.name}\n${row.department.name}`,
  },
  {
    id: 'location',
    name: i18n.t('volunteers:location'),
    sortable: true,
    selector: () => `Iasi, jud Iasi`, // TODO: TBD
  },
  {
    id: 'contact',
    name: i18n.t('general:contact'),
    sortable: true,
    selector: (row: IVolunteer) => `${row.email}\n${row.phone}`,
  },
];

const ArchivedVolunteersTableHeader = [
  ...ActiveVolunteersTableHeader,
  {
    id: 'archivedDate',
    name: i18n.t('volunteers:archived_from'),
    sortable: true,
    selector: (row: IVolunteer) => (row.archivedOn ? formatDate(row.archivedOn) : '-'),
  },
];

const BlockedVolunteersTableHeader = [
  ...ActiveVolunteersTableHeader,
  {
    id: 'blockedDate',
    name: i18n.t('volunteers:blocked_date'),
    sortable: true,
    selector: (row: IVolunteer) => (row.blockedOn ? formatDate(formatDate(row.blockedOn)) : '-'),
  },
];

const Volunteers = () => {
  const [volunteerStatus, setVolunteerStatus] = useState<VolunteerStatus>(VolunteerStatus.ACTIVE);
  const [page, setPage] = useState<number>();
  const [rowsPerPage, setRowsPerPage] = useState<number>();
  const [orderByColumn, setOrderByColumn] = useState<string>();
  const [orderDirection, setOrderDirection] = useState<OrderDirection>();

  const {
    data: volunteers,
    isLoading: isVolunteersLoading,
    error: volunteersError,
  } = useVolunteersQuery(
    volunteerStatus,
    rowsPerPage as number,
    page as number,
    orderByColumn,
    orderDirection,
  );

  useEffect(() => {
    if (volunteers?.meta) {
      setPage(volunteers.meta.currentPage);
      setRowsPerPage(volunteers.meta.itemsPerPage);
      setOrderByColumn(volunteers.meta.orderByColumn);
      setOrderDirection(volunteers.meta.orderDirection);
    }
  }, []);

  useEffect(() => {
    if (volunteersError)
      useErrorToast(
        InternalErrors.VOLUNTEER_ERRORS.getError(volunteersError.response?.data.code_error),
      );
  }, [volunteersError]);

  const onTabClick = (tab: VolunteerStatus) => {
    setVolunteerStatus(tab);
  };

  // row actions
  const onView = (row: IVolunteer) => {
    alert(`Not yet implemented, ${row}`);
  };

  const onArchive = (row: IVolunteer) => {
    console.log(`Not yet implemented, ${row}`);
  };

  const onBlock = (row: IVolunteer) => {
    alert(`Not yet implemented, ${row}`);
  };

  const onDelete = (row: IVolunteer) => {
    alert(`Not yet implemented, ${row}`);
  };

  // menu items
  const buildActiveVolunteersActionColumn = (): TableColumn<IVolunteer> => {
    const activeVolunteersMenuItems = [
      {
        label: i18n.t('volunteers:modal.view'),
        icon: <EyeIcon className="menu-icon" />,
        onClick: onView,
      },
      {
        label: i18n.t('volunteers:modal.archive'),
        icon: <PauseCircleIcon className="menu-icon" />,
        onClick: onArchive,
      },
      {
        label: i18n.t('volunteers:modal.block'),
        icon: <NoSymbolIcon className="menu-icon" />,
        onClick: onBlock,
        alert: true,
      },
    ];

    return {
      name: '',
      cell: (row: IVolunteer) => (
        <Popover<IVolunteer> row={row} items={activeVolunteersMenuItems} />
      ),
      width: '50px',
      allowOverflow: true,
    };
  };

  const buildArchivedVolunteersActionColumn = (): TableColumn<IVolunteer> => {
    const archivedVolunteersMenuItems = [
      {
        label: i18n.t('volunteers:modal.view'),
        icon: <EyeIcon className="menu-icon" />,
        onClick: onView,
      },
      {
        label: i18n.t('volunteers:modal.activate'),
        icon: <CheckCircleIcon className="menu-icon" />,
        onClick: onArchive,
      },
      {
        label: i18n.t('volunteers:modal.delete'),
        icon: <XMarkIcon className="menu-icon" />,
        onClick: onDelete,
        alert: true,
      },
      {
        label: i18n.t('volunteers:modal.block'),
        icon: <NoSymbolIcon className="menu-icon" />,
        onClick: onBlock,
        alert: true,
      },
    ];

    return {
      name: '',
      cell: (row: IVolunteer) => (
        <Popover<IVolunteer> row={row} items={archivedVolunteersMenuItems} />
      ),
      width: '50px',
      allowOverflow: true,
    };
  };

  const buildBlockedVolunteersActionColumn = (): TableColumn<IVolunteer> => {
    const blockedVolunteersMenuItems = [
      {
        label: i18n.t('volunteers:modal.view'),
        icon: <EyeIcon className="menu-icon" />,
        onClick: onView,
      },
    ];

    return {
      name: '',
      cell: (row: IVolunteer) => (
        <Popover<IVolunteer> row={row} items={blockedVolunteersMenuItems} />
      ),
      width: '50px',
      allowOverflow: true,
    };
  };

  const onSort = (column: TableColumn<IVolunteer>, direction: SortOrder) => {
    setOrderByColumn(column.id as string);
    setOrderDirection(
      direction.toLocaleUpperCase() === OrderDirection.ASC
        ? OrderDirection.ASC
        : OrderDirection.DESC,
    );
  };

  return (
    <PageLayout>
      <PageHeader>{i18n.t('side_menu:options.volunteers_list')}</PageHeader>
      <Tabs<VolunteerStatus> tabs={VolunteersTabs} onClick={onTabClick}>
        <Card>
          <CardHeader>
            <h2>{i18n.t(`volunteers:tabs.${volunteerStatus}`)}</h2>
            <Button
              label={i18n.t('general:download_table')}
              icon={<ArrowDownTrayIcon className="h-5 w-5 text-cool-gray-600" />}
              className="btn-outline-secondary"
              onClick={() => alert('Not implemented')}
            />
          </CardHeader>
          <CardBody>
            {volunteerStatus === VolunteerStatus.ACTIVE && (
              <DataTableComponent
                columns={[...ActiveVolunteersTableHeader, buildActiveVolunteersActionColumn()]}
                data={volunteers?.items}
                loading={isVolunteersLoading}
                pagination
                paginationPerPage={rowsPerPage}
                paginationRowsPerPageOptions={PaginationConfig.rowsPerPageOptions}
                paginationTotalRows={volunteers?.meta?.totalItems}
                paginationDefaultPage={page}
                onChangeRowsPerPage={setRowsPerPage}
                onChangePage={setPage}
                onSort={onSort}
              />
            )}
            {volunteerStatus === VolunteerStatus.ARCHIVED && (
              <DataTableComponent
                columns={[...ArchivedVolunteersTableHeader, buildArchivedVolunteersActionColumn()]}
                data={volunteers?.items}
                loading={isVolunteersLoading}
                pagination
                paginationPerPage={rowsPerPage}
                paginationRowsPerPageOptions={PaginationConfig.rowsPerPageOptions}
                paginationTotalRows={volunteers?.meta?.totalItems}
                paginationDefaultPage={page}
                onChangeRowsPerPage={setRowsPerPage}
                onChangePage={setPage}
                onSort={onSort}
              />
            )}
            {volunteerStatus === VolunteerStatus.BLOCKED && (
              <DataTableComponent
                columns={[...BlockedVolunteersTableHeader, buildBlockedVolunteersActionColumn()]}
                data={volunteers?.items}
                loading={isVolunteersLoading}
                pagination
                paginationPerPage={rowsPerPage}
                paginationRowsPerPageOptions={PaginationConfig.rowsPerPageOptions}
                paginationTotalRows={volunteers?.meta?.totalItems}
                paginationDefaultPage={page}
                onChangeRowsPerPage={setRowsPerPage}
                onChangePage={setPage}
                onSort={onSort}
              />
            )}
          </CardBody>
        </Card>
      </Tabs>
    </PageLayout>
  );
};

export default Volunteers;
