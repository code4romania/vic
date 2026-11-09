import React, { useEffect, useState } from 'react';
import PageLayout from '../layouts/PageLayout';
import Card from '../layouts/CardLayout';
import CardHeader from '../components/CardHeader';
import CardBody from '../components/CardBody';
import Button from '../components/Button';
import DataTableComponent from '../components/DataTableComponent';
import i18n from '../common/config/i18n';
import {
  ArrowDownTrayIcon,
  EyeIcon,
  PauseCircleIcon,
  NoSymbolIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { SortOrder, TableColumn } from 'react-data-table-component';
import Popover from '../components/Popover';
import { OrderDirection } from '../common/enums/order-direction.enum';
import { SelectItem } from '../components/Select';
import { downloadExcel, VolunteerStatusMarkerColorMapper } from '../common/utils/utils';
import StatusWithMarker from '../components/StatusWithMarker';
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
import OrganizationStructureSelect from '../containers/OrganizationStructureSelect';
import { DivisionType } from '../common/enums/division-type.enum';
import ConfirmationModal from '../components/ConfirmationModal';
import { getVolunteersForDownload } from '../services/volunteer/volunteer.api';
import { useActivityTypeListItemsQuery } from '../services/activity-type/activity-type.service';
import { ActivityTypeStatus } from '../common/enums/activity-type-status.enum';
import { VolunteersProps } from '../containers/query/VolunteersWithQueryParams';
import SelectFilter from '../containers/SelectFilter';

const STATUS_OPTIONS: SelectItem<string>[] = [
  VolunteerStatus.ACTIVE,
  VolunteerStatus.INACTIVE,
  VolunteerStatus.CANDIDATE,
  VolunteerStatus.BLOCKED,
].map((status) => ({ key: status, value: i18n.t(`volunteers:status_label.${status}`) }));

const VolunteersTableHeader = [
  {
    id: 'user.firstName',
    name: i18n.t('general:name'),
    sortable: true,
    grow: 1,
    minWidth: '5rem',
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
    id: 'volunteerProfile.email',
    name: i18n.t('general:contact'),
    sortable: true,
    grow: 1,
    minWidth: '14rem',
    selector: (row: IVolunteer) =>
      row.profile ? `${row.profile?.email}\n${row.user?.phone}` : '-',
  },
  // Hours is not sortable: it is computed per page (#475).
  {
    id: 'totalHours',
    name: i18n.t('volunteers:hours'),
    sortable: false,
    grow: 0,
    minWidth: '5rem',
    selector: (row: IVolunteer) => row.totalHours ?? 0,
  },
  {
    id: 'status',
    name: i18n.t('volunteers:status'),
    sortable: true,
    grow: 0,
    minWidth: '7rem',
    cell: (row: IVolunteer) => (
      <StatusWithMarker markerColor={VolunteerStatusMarkerColorMapper[row.status]}>
        {i18n.t(`volunteers:status_label.${row.status}`)}
      </StatusWithMarker>
    ),
  },
  {
    id: 'source',
    name: i18n.t('volunteers:source'),
    sortable: true,
    grow: 1,
    minWidth: '6rem',
    selector: (row: IVolunteer) => row.source || '-',
  },
];

const Volunteers = ({ query, setQuery }: VolunteersProps) => {
  const navigate = useNavigate();
  // Modal
  const [blockVolunteerCandidate, setBlockVolunteerCandidate] = useState<null | IVolunteer>();
  // filters
  const [branch, setBranch] = useState<SelectItem<string>>();
  const [department, setDepartment] = useState<SelectItem<string>>();
  const [role, setRole] = useState<SelectItem<string>>();

  const {
    data: volunteers,
    isLoading: isVolunteersLoading,
    error: volunteersError,
    refetch,
  } = useVolunteersQuery({
    status: query?.volunteerStatus as VolunteerStatus | undefined,
    limit: query?.limit as number,
    page: query?.page as number,
    orderBy: query?.orderBy as string,
    orderDirection: query?.orderDirection as OrderDirection,
    search: query?.search as string,
    branch: query?.branch,
    department: query?.department,
    role: query?.role,
    activityTypeId: query?.activityTypeId,
  });

  const { data: activityTypes } = useActivityTypeListItemsQuery({
    status: ActivityTypeStatus.ACTIVE,
  });

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

  // menu items, by the row's status (one list for every status, #476)
  const menuItemsFor = (row: IVolunteer) => {
    const view = {
      label: i18n.t('volunteers:popover.view'),
      icon: <EyeIcon className="menu-icon" />,
      onClick: onView,
    };
    const block = {
      label: i18n.t('volunteers:popover.block'),
      icon: <NoSymbolIcon className="menu-icon" />,
      onClick: onBlock,
      alert: true,
    };
    switch (row.status) {
      case VolunteerStatus.ACTIVE:
        return [
          view,
          {
            label: i18n.t('volunteers:popover.archive'),
            icon: <PauseCircleIcon className="menu-icon" />,
            onClick: onArchive,
          },
          block,
        ];
      case VolunteerStatus.INACTIVE:
        return [
          view,
          {
            label: i18n.t('volunteers:popover.activate'),
            icon: <CheckCircleIcon className="menu-icon" />,
            onClick: onActivate,
          },
          block,
        ];
      case VolunteerStatus.CANDIDATE:
        return [view, block];
      default:
        return [view];
    }
  };

  const actionColumn: TableColumn<IVolunteer> = {
    name: '',
    cell: (row: IVolunteer) => <Popover<IVolunteer> row={row} items={menuItemsFor(row)} />,
    width: '50px',
    allowOverflow: true,
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

  // pagination
  const onRowsPerPageChange = (limit: number) => {
    setQuery(
      {
        limit,
        page: 1,
      },
      'replaceIn',
    );
  };

  const onChangePage = (page: number) => {
    setQuery(
      {
        page,
      },
      'replaceIn',
    );
  };

  const onSort = (column: TableColumn<IVolunteer>, direction: SortOrder) => {
    setQuery(
      {
        orderBy: column.id as string,
        orderDirection:
          direction.toLocaleUpperCase() === OrderDirection.ASC
            ? OrderDirection.ASC
            : OrderDirection.DESC,
      },
      'replaceIn',
    );
  };

  const onSearch = (search: string) => {
    setQuery(
      {
        search,
      },
      'replaceIn',
    );
  };

  const onSetBranchFilter = (branch: SelectItem<string> | undefined) => {
    setBranch(branch);
    setQuery(
      {
        branch: branch?.value,
      },
      'replaceIn',
    );
  };

  const onSetDepartmentFilter = (department: SelectItem<string> | undefined) => {
    setDepartment(department);
    setQuery(
      {
        department: department?.value,
      },
      'replaceIn',
    );
  };

  const onSetRoleFilter = (role: SelectItem<string> | undefined) => {
    setRole(role);
    setQuery(
      {
        role: role?.value,
      },
      'replaceIn',
    );
  };

  const onStatusChange = (status: SelectItem<string> | undefined) => {
    setQuery({ volunteerStatus: status?.key, page: 1 }, 'replaceIn');
  };

  const onActivityTypeChange = (activityType: SelectItem<string> | undefined) => {
    setQuery({ activityTypeId: activityType?.key, page: 1 }, 'replaceIn');
  };

  const onResetFilters = () => {
    setBranch(undefined);
    setDepartment(undefined);
    setRole(undefined);
    setQuery(
      {
        volunteerStatus: undefined,
        activityTypeId: undefined,
        branch: undefined,
        department: undefined,
        role: undefined,
      },
      'replaceIn',
    );
  };

  const onExport = async () => {
    const { data: volunteersData } = await getVolunteersForDownload({
      status: query?.volunteerStatus as VolunteerStatus | undefined,
      orderBy: query?.orderBy as string,
      orderDirection: query?.orderDirection as OrderDirection,
      search: query?.search as string,
      branch: query?.branch,
      department: query?.department,
      role: query?.role,
      activityTypeId: query?.activityTypeId,
    });

    downloadExcel(volunteersData as BlobPart, i18n.t('volunteers:download'));
  };

  return (
    <PageLayout>
      <PageHeader>{i18n.t('side_menu:options.volunteers_list')}</PageHeader>
      <DataTableFilters
        onSearch={onSearch}
        searchValue={query?.search}
        searchPlaceholder={i18n.t('volunteers:search_placeholder').toString()}
        onResetFilters={onResetFilters}
      >
        <SelectFilter
          label={`${i18n.t('volunteers:status')}`}
          placeholder={`${i18n.t('volunteers:filters.all_statuses')}`}
          options={STATUS_OPTIONS}
          onChange={onStatusChange}
          defaultValue={query?.volunteerStatus}
          allowDeselect
        />
        <SelectFilter
          label={`${i18n.t('volunteers:filters.activity_type')}`}
          placeholder={`${i18n.t('volunteers:filters.all_activity_types')}`}
          options={(activityTypes ?? []).map((type) => ({ key: type.id, value: type.name }))}
          onChange={onActivityTypeChange}
          defaultValue={query?.activityTypeId}
          allowDeselect
        />
        <OrganizationStructureSelect
          label={`${i18n.t('division:entity.branch')}`}
          placeholder={`${i18n.t('general:select', { item: '' })}`}
          onChange={onSetBranchFilter}
          selected={branch}
          defaultValue={query.branch}
          type={DivisionType.BRANCH}
        />
        <OrganizationStructureSelect
          label={`${i18n.t('division:entity.department')}`}
          placeholder={`${i18n.t('general:select', { item: '' })}`}
          onChange={onSetDepartmentFilter}
          selected={department}
          defaultValue={query.department}
          type={DivisionType.DEPARTMENT}
        />
        <OrganizationStructureSelect
          label={`${i18n.t('division:entity.role')}`}
          placeholder={`${i18n.t('general:select', { item: '' })}`}
          onChange={onSetRoleFilter}
          selected={role}
          defaultValue={query.role}
          type={DivisionType.ROLE}
        />
      </DataTableFilters>
      <Card>
        <CardHeader>
          <h2>{i18n.t('volunteers:found', { count: volunteers?.meta?.totalItems ?? 0 })}</h2>
          <Button
            label={i18n.t('general:download_table')}
            icon={<ArrowDownTrayIcon className="h-5 w-5 text-cool-gray-600" />}
            className="btn-outline-secondary"
            onClick={onExport}
          />
        </CardHeader>
        <CardBody>
          <DataTableComponent
            columns={[...VolunteersTableHeader, actionColumn]}
            data={volunteers?.items}
            loading={
              isVolunteersLoading ||
              isArchivingVolunteer ||
              isActivatingVolunteer ||
              isBlockingVolunteer
            }
            pagination
            paginationPerPage={query.limit as number}
            paginationTotalRows={volunteers?.meta?.totalItems}
            paginationDefaultPage={query.page as number}
            onChangeRowsPerPage={onRowsPerPageChange}
            onChangePage={onChangePage}
            onSort={onSort}
          />
        </CardBody>
      </Card>
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
