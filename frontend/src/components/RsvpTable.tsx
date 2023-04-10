import React, { useEffect, useState } from 'react';
import OrganizationStructureSelect from '../containers/OrganizationStructureSelect';
import { downloadExcel } from '../common/utils/utils';
import Card from '../layouts/CardLayout';
import Button from './Button';
import CardHeader from './CardHeader';
import { DivisionType } from '../common/enums/division-type.enum';
import { RSVPGoingEnum } from '../common/enums/rsvp.enum';
import { getEventRSVPsForDownload } from '../services/event/event.api';
import DataTableComponent from './DataTableComponent';
import DataTableFilters from './DataTableFilters';
import Select, { SelectItem } from './Select';
import { InternalErrors } from '../common/errors/internal-errors.class';
import MediaCell from '../components/MediaCell';
import CellLayout from '../layouts/CellLayout';
import { useErrorToast } from '../hooks/useToast';
import { OrderDirection } from '../common/enums/order-direction.enum';
import { SortOrder, TableColumn } from 'react-data-table-component';
import { IRsvp } from '../common/interfaces/rsvp.interface';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import i18n from '../common/config/i18n';
import { useRsvpsQuery } from '../services/event/event.service';
import CardBody from './CardBody';
import { RsvpTableBasicProps } from '../containers/query/RsvpTableWithQueryParams';

const TableHeader = [
  {
    id: 'user.name',
    name: i18n.t('general:name'),
    sortable: true,
    minWidth: '10rem',
    grow: 2,
    cell: (row: IRsvp) => <MediaCell logo={row.logo} title={row.userName} />,
  },
  {
    id: 'going',
    name: i18n.t('general:answer'),
    minWidth: '11rem',
    grow: 1,
    sortable: true,
    selector: (row: IRsvp) =>
      row.going ? i18n.t('events:participate') : i18n.t('events:not_participate'),
  },
  {
    id: 'volunteerId',
    name: i18n.t('events:volunteer'),
    minWidth: '10rem',
    grow: 1,
    selector: (row: IRsvp) => (row.volunteerId ? i18n.t('general:yes') : i18n.t('general:no')),
  },
  {
    id: 'mention',
    name: i18n.t('events:form.mention.label'),
    minWidth: '9rem',
    grow: 1,
    sortable: true,
    cell: (row: IRsvp) => (
      <CellLayout>
        <small title={row.mention} className="text-overflow">
          {row.mention ? row.mention : '-'}
        </small>
      </CellLayout>
    ),
  },
];

const ResponseSelectOptions = [
  { key: RSVPGoingEnum.YES, value: i18n.t('events:participate') },
  { key: RSVPGoingEnum.NO, value: i18n.t('events:not_participate') },
];

interface RsvpTableProps extends RsvpTableBasicProps {
  eventId: string;
}

const RsvpTable = ({ eventId, query, setQuery }: RsvpTableProps) => {
  // filters
  const [branch, setBranch] = useState<SelectItem<string>>();
  const [department, setDepartment] = useState<SelectItem<string>>();
  const [role, setRole] = useState<SelectItem<string>>();

  const {
    data: rsvps,
    isLoading: isRsvpsLoading,
    error: rsvpsError,
  } = useRsvpsQuery(
    eventId,
    query.limit,
    query.page,
    query.orderBy,
    query.orderDirection as OrderDirection,
    query.search,
    query?.branch,
    query?.department,
    query?.role,
    query.going,
  );

  useEffect(() => {
    if (rsvpsError) {
      useErrorToast(InternalErrors.EVENT_ERRORS.getError(rsvpsError?.response?.data.code_error));
    }
  }, [rsvpsError]);

  const onSort = (column: TableColumn<IRsvp>, direction: SortOrder) => {
    setQuery({
      orderBy: column.id as string,
      orderDirection:
        direction.toLocaleUpperCase() === OrderDirection.ASC
          ? OrderDirection.ASC
          : OrderDirection.DESC,
    });
  };

  const onResponseChange = (response: SelectItem<RSVPGoingEnum>) => {
    setQuery({ going: response.key });
  };

  const onResetFilters = () => {
    setBranch(undefined);
    setDepartment(undefined);
    setRole(undefined);
    setQuery({ activeTab: query.activeTab }, 'push');
  };

  const onExportRSVPs = async () => {
    const { data: eventRSVPsData } = await getEventRSVPsForDownload(
      eventId,
      query.orderBy,
      query.orderDirection as OrderDirection,
      query.search,
      query?.branch,
      query?.department,
      query?.role,
      query.going,
    );

    downloadExcel(eventRSVPsData as BlobPart, i18n.t('events:download_rsvp'));
  };

  const onSetBranchFilter = (branch: SelectItem<string>) => {
    setBranch(branch);
    setQuery({
      branch: branch?.value,
    });
  };

  const onSetDepartmentFilter = (department: SelectItem<string>) => {
    setDepartment(department);
    setQuery({
      department: department?.value,
    });
  };

  const onSetRoleFilter = (role: SelectItem<string>) => {
    setRole(role);
    setQuery({
      role: role?.value,
    });
  };

  // pagination
  const onRowsPerPageChange = (limit: number) => {
    setQuery({
      limit,
      page: 1,
    });
  };

  const onChangePage = (page: number) => {
    setQuery({
      page,
    });
  };

  const onSearch = (search: string) => {
    setQuery({
      search,
    });
  };

  return (
    <>
      <DataTableFilters
        onSearch={onSearch}
        searchValue={query?.search}
        onResetFilters={onResetFilters}
      >
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
        <Select
          label={`${i18n.t('general:answer')}`}
          placeholder={`${i18n.t('general:select', { item: '' })}`}
          onChange={onResponseChange}
          selected={ResponseSelectOptions.find((option) => option.key === query.going)}
          options={ResponseSelectOptions}
        />
      </DataTableFilters>
      <Card>
        <CardHeader>
          <h2>{i18n.t('events:responses_list')}</h2>
          <Button
            label={i18n.t('general:download_table')}
            icon={<ArrowDownTrayIcon className="h-5 w-5 text-cool-gray-600" />}
            className="btn-outline-secondary ml-auto"
            onClick={onExportRSVPs}
          />
        </CardHeader>
        <CardBody>
          <DataTableComponent
            columns={TableHeader}
            data={rsvps?.items}
            loading={isRsvpsLoading}
            pagination
            paginationPerPage={query.limit}
            paginationTotalRows={rsvps?.meta?.totalItems}
            paginationDefaultPage={query.page}
            onChangeRowsPerPage={onRowsPerPageChange}
            onChangePage={onChangePage}
            onSort={onSort}
          />
        </CardBody>
      </Card>
    </>
  );
};

export default RsvpTable;
