import React, { useEffect, useState } from 'react';
import OrganizationStructureSelect from '../containers/OrganizationStructureSelect';
import { downloadExcel, formatDate } from '../common/utils/utils';
import Card from '../layouts/CardLayout';
import Button from './Button';
import ExportRegistrationsModal from './ExportRegistrationsModal';
import CardHeader from './CardHeader';
import { DivisionType } from '../common/enums/division-type.enum';
import { RSVPGoingEnum } from '../common/enums/rsvp.enum';
import { EventRegistrationStatus } from '../common/enums/event-registration-status.enum';
import { getEventRSVPsForDownload } from '../services/event/event.api';
import DataTableComponent from './DataTableComponent';
import DataTableFilters from './DataTableFilters';
import { SelectItem } from './Select';
import { InternalErrors } from '../common/errors/internal-errors.class';
import MediaCell from '../components/MediaCell';
import CellLayout from '../layouts/CellLayout';
import StatusBadge, { BadgeTone } from './StatusBadge';
import { useErrorToast } from '../hooks/useToast';
import { OrderDirection } from '../common/enums/order-direction.enum';
import { SortOrder, TableColumn } from 'react-data-table-component';
import { IRsvp } from '../common/interfaces/rsvp.interface';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import i18n from '../common/config/i18n';
import { useRsvpsQuery } from '../services/event/event.service';
import CardBody from './CardBody';
import { RsvpTableBasicProps } from '../containers/query/RsvpTableWithQueryParams';
import SelectFilter from '../containers/SelectFilter';

type RsvpAnswer = 'approved' | 'pending' | 'rejected' | 'not_going';

const rsvpAnswer = (row: IRsvp): RsvpAnswer =>
  !row.going
    ? 'not_going'
    : row.status === EventRegistrationStatus.PENDING
      ? 'pending'
      : row.status === EventRegistrationStatus.REJECTED
        ? 'rejected'
        : 'approved';

const ANSWER_TONE: Record<RsvpAnswer, BadgeTone> = {
  approved: 'green',
  pending: 'amber',
  rejected: 'red',
  not_going: 'gray',
};

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
    minWidth: '9rem',
    grow: 1,
    sortable: true,
    // #501: a "going" answer shows the NGO's decision too
    cell: (row: IRsvp) => {
      const answer = rsvpAnswer(row);
      return (
        <StatusBadge tone={ANSWER_TONE[answer]}>
          {i18n.t(`events:rsvp_status.${answer}`)}
        </StatusBadge>
      );
    },
  },
  {
    id: 'createdOn',
    name: i18n.t('events:registrations.header.registered_on'),
    minWidth: '8rem',
    grow: 1,
    selector: (row: IRsvp) => formatDate(row.createdOn),
  },
  {
    id: 'volunteerId',
    name: i18n.t('events:volunteer'),
    minWidth: '12rem',
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

const ResponseSelectOptions: SelectItem<RSVPGoingEnum>[] = [
  { key: RSVPGoingEnum.YES, value: i18n.t('events:participate') },
  { key: RSVPGoingEnum.NO, value: i18n.t('events:not_participate') },
];

interface RsvpTableProps extends RsvpTableBasicProps {
  eventId: string;
  // names the exported file: "Înscrieri <event>.xlsx"
  eventName?: string;
}

const RsvpTable = ({ eventId, eventName, query, setQuery }: RsvpTableProps) => {
  // #497
  const [showExport, setShowExport] = useState<boolean>(false);
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

  const onResponseChange = (response: SelectItem<string> | undefined) => {
    setQuery({ going: response?.key as RSVPGoingEnum }, 'replaceIn');
  };

  const onResetFilters = () => {
    setBranch(undefined);
    setDepartment(undefined);
    setRole(undefined);
    setQuery(
      {
        search: undefined,
        branch: undefined,
        department: undefined,
        role: undefined,
        going: undefined,
        page: 1,
      },
      'replaceIn',
    );
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

  const onSearch = (search: string) => {
    setQuery(
      {
        search,
      },
      'replaceIn',
    );
  };

  return (
    <>
      <DataTableFilters
        onSearch={onSearch}
        searchValue={query?.search}
        searchPlaceholder={`${i18n.t('events:detail.search')}`}
        onResetFilters={onResetFilters}
        results={
          <>
            <span>
              {i18n.t('events:detail.responses_found', { count: rsvps?.meta?.totalItems ?? 0 })}
            </span>
            <Button
              label={i18n.t('general:download_table')}
              icon={<ArrowDownTrayIcon className="h-5 w-5 text-cool-gray-600" />}
              className="btn-text-primary px-2"
              onClick={onExportRSVPs}
            />
          </>
        }
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
        <SelectFilter
          label={`${i18n.t('general:answer')}`}
          placeholder={`${i18n.t('general:select', { item: '' })}`}
          onChange={onResponseChange}
          options={ResponseSelectOptions}
          defaultValue={query.going}
          allowDeselect
        />
      </DataTableFilters>
      <Card>
        <CardHeader>
          <h2>
            {i18n.t('events:detail.responses_title', { count: rsvps?.meta?.totalItems ?? 0 })}
          </h2>
          <Button
            label={i18n.t('events:export_registrations.button')}
            icon={<ArrowDownTrayIcon className="h-5 w-5 text-cool-gray-600" />}
            className="btn-outline-secondary ml-auto"
            onClick={() => setShowExport(true)}
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
      {showExport && (
        <ExportRegistrationsModal
          eventId={eventId}
          eventName={eventName}
          onClose={() => setShowExport(false)}
        />
      )}
    </>
  );
};

export default RsvpTable;
