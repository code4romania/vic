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
import Select, { SelectItem } from '../components/Select';
import { downloadExcel, formatDate, formatLocation } from '../common/utils/utils';
import { useErrorToast, useSuccessToast } from '../hooks/useToast';
import { InternalErrors } from '../common/errors/internal-errors.class';
import MediaCell from '../components/MediaCell';
import {
  useActivateVolunteerMutation,
  useArchiveVolunteerMutation,
  useBlockVolunteerMutation,
  useVolunteersQuery,
} from '../services/volunteer/volunteer.service';
import PageHeader from '../components/PageHeader';
import { IVolunteer } from '../common/interfaces/volunteer.interface';
import { VolunteerStatus } from '../common/enums/volunteer-status.enum';
import { useNavigate } from 'react-router-dom';
import DataTableFilters from '../components/DataTableFilters';
import DateRangePicker from '../components/DateRangePicker';
import LocationSelect from '../containers/LocationSelect';
import { ListItem } from '../common/interfaces/list-item.interface';
import OrganizationStructureSelect from '../containers/OrganizationStructureSelect';
import { DivisionType } from '../common/enums/division-type.enum';
import { AgeRangeEnum } from '../common/enums/age-range.enum';
import ConfirmationModal from '../components/ConfirmationModal';
import { getVolunteersForDownload } from '../services/volunteer/volunteer.api';
import CellLayout from '../layouts/CellLayout';

const VolunteersTabs: SelectItem<VolunteerStatus>[] = [
  { key: VolunteerStatus.ACTIVE, value: i18n.t('volunteers:tabs.active') },
  { key: VolunteerStatus.ARCHIVED, value: i18n.t('volunteers:tabs.archived') },
  { key: VolunteerStatus.BLOCKED, value: i18n.t('volunteers:tabs.blocked') },
];

const AgeRangeOptions: SelectItem<AgeRangeEnum>[] = [
  {
    key: AgeRangeEnum['0_18'],
    value: '0-18',
  },
  {
    key: AgeRangeEnum['18_30'],
    value: '18-30',
  },
  {
    key: AgeRangeEnum['30_50'],
    value: '30-50',
  },
  {
    key: AgeRangeEnum.OVER_50,
    value: '>50',
  },
];

const ActiveVolunteersTableHeader = [
  {
    id: 'user.name',
    name: i18n.t('general:name'),
    sortable: true,
    grow: 2,
    minWidth: '10rem',
    cell: (row: IVolunteer) => (
      <MediaCell
        logo={row.user?.profilePicture || ''}
        title={row.user.name}
        subtitle={row.profile?.branch?.name || ''}
      />
    ),
  },
  {
    id: 'department.name',
    name: i18n.t('volunteers:department_and_role'),
    sortable: true,
    grow: 1,
    minWidth: '9rem',
    selector: (row: IVolunteer) =>
      row.profile?.department || row?.profile?.role
        ? `${row.profile?.role?.name || ''}${
            row.profile?.role && row.profile?.department ? '\n' : ''
          }${row.profile?.department?.name || ''}`
        : '-',
  },
  {
    id: 'location.name',
    name: i18n.t('volunteers:location'),
    sortable: true,
    grow: 1,
    minWidth: '5rem',
    selector: (row: IVolunteer) => formatLocation(row.user.location),
  },
  {
    id: 'volunteerProfile.email',
    name: i18n.t('general:contact'),
    sortable: true,
    grow: 1,
    minWidth: '5rem',
    selector: (row: IVolunteer) =>
      row.profile ? `${row.profile?.email}\n${row.profile?.phone}` : '-',
  },
];

const ArchivedVolunteersTableHeader = [
  ...ActiveVolunteersTableHeader,
  {
    id: 'archivedOn',
    name: i18n.t('volunteers:archived_on'),
    sortable: true,
    cell: (row: IVolunteer) => (
      <CellLayout>{row.archivedOn ? formatDate(row.archivedOn) : '-'}</CellLayout>
    ),
  },
];

const BlockedVolunteersTableHeader = [
  ...ActiveVolunteersTableHeader,
  {
    id: 'blockedOn',
    name: i18n.t('volunteers:blocked_on'),
    sortable: true,
    cell: (row: IVolunteer) => (
      <CellLayout>{row.blockedOn ? formatDate(row.blockedOn) : '-'}</CellLayout>
    ),
  },
];

const Volunteers = () => {
  const navigate = useNavigate();

  const [volunteerStatus, setVolunteerStatus] = useState<VolunteerStatus>(VolunteerStatus.ACTIVE);
  const [page, setPage] = useState<number>();
  const [rowsPerPage, setRowsPerPage] = useState<number>();
  const [orderByColumn, setOrderByColumn] = useState<string>();
  const [orderDirection, setOrderDirection] = useState<OrderDirection>();
  // Modal
  const [blockVolunteerCandidate, setBlockVolunteerCandidate] = useState<null | IVolunteer>();
  // filters
  const [searchWord, setSearchWord] = useState<string>();
  const [createdOnRange, setCreatedOnRange] = useState<Date[]>([]);
  const [location, setLocation] = useState<ListItem>();
  const [branch, setBranch] = useState<SelectItem<string>>();
  const [department, setDepartment] = useState<SelectItem<string>>();
  const [role, setRole] = useState<SelectItem<string>>();
  const [age, setAge] = useState<SelectItem<AgeRangeEnum>>();

  const {
    data: volunteers,
    isLoading: isVolunteersLoading,
    error: volunteersError,
    refetch,
  } = useVolunteersQuery(
    volunteerStatus,
    rowsPerPage as number,
    page as number,
    orderByColumn,
    orderDirection,
    searchWord,
    age?.key,
    branch?.key,
    department?.key,
    role?.key,
    location?.value,
    createdOnRange[0],
    createdOnRange[1],
  );

  //actions
  const { mutateAsync: archiveVolunteer, isLoading: isArchivingVolunteer } =
    useArchiveVolunteerMutation();

  const { mutateAsync: activateVolunteer, isLoading: isActivatingVolunteer } =
    useActivateVolunteerMutation();

  const { mutateAsync: blockVolunteer, isLoading: isBlockingVolunteer } =
    useBlockVolunteerMutation();

  useEffect(() => {
    if (volunteersError)
      useErrorToast(
        InternalErrors.VOLUNTEER_ERRORS.getError(volunteersError.response?.data.code_error),
      );
  }, [volunteersError]);

  const onTabClick = (tab: VolunteerStatus) => {
    setVolunteerStatus(tab);
  };

  // menu items
  const buildActiveVolunteersActionColumn = (): TableColumn<IVolunteer> => {
    const activeVolunteersMenuItems = [
      {
        label: i18n.t('volunteers:popover.view'),
        icon: <EyeIcon className="menu-icon" />,
        onClick: onView,
      },
      {
        label: i18n.t('volunteers:popover.archive'),
        icon: <PauseCircleIcon className="menu-icon" />,
        onClick: onArchive,
      },
      {
        label: i18n.t('volunteers:popover.block'),
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
        label: i18n.t('volunteers:popover.view'),
        icon: <EyeIcon className="menu-icon" />,
        onClick: onView,
      },
      {
        label: i18n.t('volunteers:popover.activate'),
        icon: <CheckCircleIcon className="menu-icon" />,
        onClick: onActivate,
      },
      {
        label: i18n.t('volunteers:popover.delete'),
        icon: <XMarkIcon className="menu-icon" />,
        onClick: onDelete,
        alert: true,
      },
      {
        label: i18n.t('volunteers:popover.block'),
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
        label: i18n.t('volunteers:popover.view'),
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

  // row actions
  const onView = (row: IVolunteer) => {
    navigate(`${row.id}`);
  };

  const onArchive = (row: IVolunteer) => {
    archiveVolunteer(row.id, {
      onSuccess: () => {
        useSuccessToast(i18n.t('volunteers:submit.archive'));
        refetch();
      },
      onError: (error) => {
        useErrorToast(InternalErrors.VOLUNTEER_ERRORS.getError(error.response?.data.code_error));
      },
    });
  };

  const onActivate = (row: IVolunteer) => {
    activateVolunteer(row.id, {
      onSuccess: () => {
        useSuccessToast(i18n.t('volunteers:submit.activate'));
        refetch();
      },
      onError: (error) => {
        useErrorToast(InternalErrors.VOLUNTEER_ERRORS.getError(error.response?.data.code_error));
      },
    });
  };

  const onBlock = (row: IVolunteer) => {
    setBlockVolunteerCandidate(row);
  };

  const onDelete = (row: IVolunteer) => {
    alert(`Not yet implemented, ${row}`);
  };

  const onSort = (column: TableColumn<IVolunteer>, direction: SortOrder) => {
    setOrderByColumn(column.id as string);
    setOrderDirection(
      direction.toLocaleUpperCase() === OrderDirection.ASC
        ? OrderDirection.ASC
        : OrderDirection.DESC,
    );
  };

  const onConfirmBlockModal = () => {
    if (blockVolunteerCandidate)
      blockVolunteer(blockVolunteerCandidate.id, {
        onSuccess: () => {
          useSuccessToast(i18n.t('volunteers:submit.block'));
          refetch();
        },
        onError: (error) => {
          useErrorToast(InternalErrors.VOLUNTEER_ERRORS.getError(error.response?.data.code_error));
        },
        onSettled: () => {
          setBlockVolunteerCandidate(null);
        },
      });
  };

  const onResetFilters = () => {
    setCreatedOnRange([]);
    setLocation(undefined);
    setBranch(undefined);
    setDepartment(undefined);
    setRole(undefined);
    setAge(undefined);
    setSearchWord(undefined);
  };

  const onExport = async () => {
    const { data: volunteersData } = await getVolunteersForDownload(
      volunteerStatus,
      orderByColumn,
      orderDirection,
      searchWord,
      age?.key,
      branch?.key,
      department?.key,
      role?.key,
      location?.value,
      createdOnRange[0],
      createdOnRange[1],
    );

    downloadExcel(volunteersData as BlobPart, i18n.t('volunteers:download'));
  };

  return (
    <PageLayout>
      <PageHeader>{i18n.t('side_menu:options.volunteers_list')}</PageHeader>
      <Tabs<VolunteerStatus> tabs={VolunteersTabs} onClick={onTabClick}>
        <DataTableFilters onSearch={setSearchWord} onResetFilters={onResetFilters}>
          <DateRangePicker
            label={i18n.t('volunteers:filters.active_since_range')}
            onChange={setCreatedOnRange}
            value={createdOnRange.length > 0 ? createdOnRange : undefined}
            id="created-on-range__picker"
          />
          <OrganizationStructureSelect
            label={`${i18n.t('division:entity.branch')}`}
            placeholder={`${i18n.t('general:select', { item: '' })}`}
            onChange={setBranch}
            selected={branch}
            type={DivisionType.BRANCH}
          />
          <OrganizationStructureSelect
            label={`${i18n.t('division:entity.department')}`}
            placeholder={`${i18n.t('general:select', { item: '' })}`}
            onChange={setDepartment}
            selected={department}
            type={DivisionType.DEPARTMENT}
          />
          <OrganizationStructureSelect
            label={`${i18n.t('division:entity.role')}`}
            placeholder={`${i18n.t('general:select', { item: '' })}`}
            onChange={setRole}
            selected={role}
            type={DivisionType.ROLE}
          />
          <LocationSelect
            label={i18n.t('general:location')}
            onSelect={setLocation}
            defaultValue={location}
          />
          <Select
            label={`${i18n.t('general:age')}`}
            placeholder={`${i18n.t('general:select', { item: '' })}`}
            options={AgeRangeOptions}
            onChange={setAge}
            selected={age}
          />
        </DataTableFilters>
        <Card>
          <CardHeader>
            <h2>{i18n.t(`volunteers:tabs.${volunteerStatus}`)}</h2>
            <Button
              label={i18n.t('general:download_table')}
              icon={<ArrowDownTrayIcon className="h-5 w-5 text-cool-gray-600" />}
              className="btn-outline-secondary"
              onClick={onExport}
            />
          </CardHeader>
          <CardBody>
            {volunteerStatus === VolunteerStatus.ACTIVE && (
              <DataTableComponent
                columns={[...ActiveVolunteersTableHeader, buildActiveVolunteersActionColumn()]}
                data={volunteers?.items}
                loading={isVolunteersLoading || isArchivingVolunteer || isBlockingVolunteer}
                pagination
                paginationPerPage={rowsPerPage}
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
                loading={isVolunteersLoading || isActivatingVolunteer || isBlockingVolunteer}
                pagination
                paginationPerPage={rowsPerPage}
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
      {blockVolunteerCandidate && (
        <ConfirmationModal
          title={i18n.t('volunteers:modal.block.title')}
          description={i18n.t('volunteers:modal.block.description')}
          confirmBtnLabel={i18n.t('volunteers:popover.block')}
          confirmBtnClassName="btn-danger"
          onClose={setBlockVolunteerCandidate.bind(null, null)}
          onConfirm={onConfirmBlockModal}
        />
      )}
    </PageLayout>
  );
};

export default Volunteers;
