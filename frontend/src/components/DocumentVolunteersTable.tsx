import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PageLayout from '../layouts/PageLayout';
import Card from '../layouts/CardLayout';
import CardBody from './CardBody';
import DataTableComponent from './DataTableComponent';
import i18n from '../common/config/i18n';
import { SortOrder, TableColumn } from 'react-data-table-component';
import { OrderDirection } from '../common/enums/order-direction.enum';
import { SelectItem } from './Select';
import { AgeRangeOptions, formatLocation } from '../common/utils/utils';
import { useErrorToast } from '../hooks/useToast';
import { InternalErrors } from '../common/errors/internal-errors.class';
import MediaCell from './MediaCell';
import { useVolunteersQuery } from '../services/volunteer/volunteer.service';
import { IVolunteer } from '../common/interfaces/volunteer.interface';
import { VolunteerStatus } from '../common/enums/volunteer-status.enum';
import DataTableFilters from './DataTableFilters';
import DateRangePicker from './DateRangePicker';
import LocationSelect from '../containers/LocationSelect';
import { ListItem } from '../common/interfaces/list-item.interface';
import OrganizationStructureSelect from '../containers/OrganizationStructureSelect';
import { DivisionType } from '../common/enums/division-type.enum';
import { AgeRangeEnum } from '../common/enums/age-range.enum';
import SelectFilter from '../containers/SelectFilter';
import CardHeader from './CardHeader';
import { DocumentVolunteersProps } from '../containers/query/DocumentVolunteersTableWithQueryParams';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { Tooltip } from 'react-tooltip';
import {
  checkIsVolunteerDataIncomplete,
  VolunteerDataCheck,
} from '../common/utils/volunteer-data.util';

const ActiveVolunteersTableHeader = [
  {
    id: 'user.firstName',
    name: i18n.t('general:name'),
    sortable: true,
    grow: 1.5,
    minWidth: '5rem',
    cell: (row: IVolunteer & { completionStatus: VolunteerDataCheck }) => (
      <div className="flex flex-row gap-2 w-full items-center justify-between">
        <div className="flex-1 flex flex-row w-[12rem]">
          <MediaCell
            logo={row.user?.profilePicture || ''}
            title={row.user.name}
            subtitle={row.profile?.branch?.name || ''}
            nameContainerClassName="w-3/5"
          />
        </div>
        <div className="">
          {row.completionStatus?.isIncomplete && (
            <>
              <ExclamationCircleIcon
                width={20}
                height={20}
                color="red"
                data-tooltip-id={`error-tooltip-${row.user.id}`}
              />
              <Tooltip
                id={`error-tooltip-${row.user.id}`}
                place="top"
                content={row.completionStatus?.missingInfo}
                arrowColor="red"
                border="2px solid red"
                opacity={1}
                style={{
                  maxWidth: '200px',
                  zIndex: 100_000,
                  backgroundColor: 'white',
                  color: 'black',
                }}
              />
            </>
          )}
        </div>
      </div>
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
    minWidth: '14rem',
    selector: (row: IVolunteer) =>
      row.profile ? `${row.profile?.email}\n${row.user?.phone}` : '-',
  },
];

const DocumentVolunteersTable = ({
  query,
  setQuery,
  selectedVolunteers,
  setSelectedVolunteers,
}: DocumentVolunteersProps) => {
  // filters
  const [location, setLocation] = useState<ListItem>();
  const [branch, setBranch] = useState<SelectItem<string>>();
  const [department, setDepartment] = useState<SelectItem<string>>();
  const [role, setRole] = useState<SelectItem<string>>();

  const firstRender = useRef(true);

  useEffect(() => {
    firstRender.current = false;
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const {
    data: volunteers,
    isLoading: isVolunteersLoading,
    error: volunteersError,
  } = useVolunteersQuery(
    query?.volunteerStatus as VolunteerStatus,
    query?.limit as number,
    query?.page as number,
    query?.orderBy as string,
    query?.orderDirection as OrderDirection,
    query?.search as string,
    query?.age as AgeRangeEnum,
    query?.branch,
    query?.department,
    query?.role,
    query?.location && query?.location[0],
    query?.location && query?.location[1],
    query?.createdOnStart as Date,
    query?.createdOnEnd as Date,
  );

  const volunteersWithChecks = useMemo(() => {
    return volunteers?.items?.map((volunteer: IVolunteer) => {
      const completionStatus = checkIsVolunteerDataIncomplete(volunteer);
      return {
        ...volunteer,
        completionStatus,
      };
    });
  }, [volunteers]);

  useEffect(() => {
    if (volunteersError)
      useErrorToast(
        InternalErrors.VOLUNTEER_ERRORS.getError(volunteersError.response?.data.code_error),
      );
  }, [volunteersError]);

  const handleOnSelectVolunteers = (volunteers: IVolunteer[]) => {
    if (volunteers.length === 0) {
      setSelectedVolunteers(volunteers);
    } else if (volunteers.length !== selectedVolunteers?.length) {
      setSelectedVolunteers(volunteers);
    }
  };

  const defaultSelectedRows = useCallback(
    (row: IVolunteer) => {
      return selectedVolunteers?.some((volunteer: IVolunteer) => volunteer.id === row.id);
    },
    [selectedVolunteers],
  );

  // We're doing this because of a bug in DataTableComponent
  // https://github.com/jbetancur/react-data-table-component/issues/930
  // https://github.com/jbetancur/react-data-table-component/issues/955

  // While some fixes exist we should be able to also unselect the row, thus removing props after the first render is the only way that works.
  const selectProps = {
    ...(firstRender.current && {
      selectableRowSelected: defaultSelectedRows,
    }),
    ...(!firstRender.current && {
      onSelectedRowsChange: handleOnSelectVolunteers,
    }),
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

  const onSort = (
    column: TableColumn<IVolunteer & { completionStatus: VolunteerDataCheck }>,
    direction: SortOrder,
  ) => {
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

  const onCreatedOnRangeChange = ([createdOnStart, createdOnEnd]: Date[]) => {
    setQuery(
      {
        createdOnStart,
        createdOnEnd,
      },
      'replaceIn',
    );
  };

  const onLocationChange = (location: ListItem) => {
    setLocation(location);
    setQuery(
      {
        location: location.label.split(', '),
      },
      'replaceIn',
    );
  };

  const onAgeRangeChange = (selectedRange: SelectItem<string> | undefined) => {
    setQuery(
      {
        age: selectedRange?.key,
      },
      'replaceIn',
    );
  };

  const onResetFilters = () => {
    setLocation(undefined);
    setBranch(undefined);
    setDepartment(undefined);
    setRole(undefined);
    setQuery(
      {
        volunteerStatus: query.volunteerStatus,
        location: undefined,
        branch: undefined,
        department: undefined,
        role: undefined,
        age: undefined,
        createdOnEnd: undefined,
        createdOnStart: undefined,
      },
      'replaceIn',
    );
  };

  return (
    <PageLayout>
      <DataTableFilters
        onSearch={onSearch}
        searchValue={query?.search}
        onResetFilters={onResetFilters}
      >
        <DateRangePicker
          label={i18n.t('volunteers:filters.active_since_range')}
          onChange={(range: [Date | null, Date | null]) => {
            const [createdOnStart, createdOnEnd] = range;
            onCreatedOnRangeChange([createdOnStart as Date, createdOnEnd as Date]);
          }}
          value={
            query?.createdOnStart && query?.createdOnEnd
              ? [query?.createdOnStart, query?.createdOnEnd]
              : undefined
          }
          id="created-on-range__picker"
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
        <LocationSelect
          label={i18n.t('general:location')}
          onSelect={onLocationChange}
          value={location}
          defaultCity={query.location && query.location[0]}
          defaultCounty={query.location && query.location[1]}
        />
        <SelectFilter
          label={`${i18n.t('general:age')}`}
          placeholder={`${i18n.t('general:select', { item: '' })}`}
          options={AgeRangeOptions}
          onChange={onAgeRangeChange}
          defaultValue={query?.age}
          allowDeselect
        />
      </DataTableFilters>
      <Card>
        <CardHeader>
          <h2>{i18n.t('side_menu:options.volunteers_list')}</h2>
        </CardHeader>
        <CardBody>
          {query?.volunteerStatus === VolunteerStatus.ACTIVE && (
            <DataTableComponent
              {...selectProps}
              columns={[...ActiveVolunteersTableHeader]}
              data={volunteersWithChecks}
              loading={isVolunteersLoading}
              pagination
              selectableRowDisabled={(row: IVolunteer & { completionStatus: VolunteerDataCheck }) =>
                row.completionStatus.isIncomplete
              }
              selectableRows
              paginationPerPage={query.limit as number}
              paginationTotalRows={volunteers?.meta?.totalItems}
              paginationDefaultPage={query.page as number}
              onChangeRowsPerPage={onRowsPerPageChange}
              onChangePage={onChangePage}
              onSort={onSort}
            />
          )}
        </CardBody>
      </Card>
    </PageLayout>
  );
};

export default DocumentVolunteersTable;
