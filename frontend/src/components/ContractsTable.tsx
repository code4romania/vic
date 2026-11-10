import React, { ReactNode, useEffect, useState } from 'react';
import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  DocumentTextIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { Media, SortOrder, TableColumn } from 'react-data-table-component';
import { useQueryClient } from 'react-query';
import { useTranslation } from 'react-i18next';
import i18n from '../common/config/i18n';
import {
  ContractFilterStatus,
  ContractStatus,
  EXPIRING_SOON,
} from '../common/enums/contract-status.enum';
import { DocumentType } from '../common/enums/document-type.enum';
import { OrderDirection } from '../common/enums/order-direction.enum';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { IContractListItem } from '../common/interfaces/contract.interface';
import { downloadExcel, downloadFile, formatDate, formatDateRange } from '../common/utils/utils';
import { ContractsTableBasicProps } from '../containers/query/ContractsTableWithQueryParams';
import { useErrorToast, useSuccessToast } from '../hooks/useToast';
import Card from '../layouts/CardLayout';
import CellLayout from '../layouts/CellLayout';
import { getContractsForDownload } from '../services/contracts/contracts.api';
import {
  useContractsQuery,
  useDeleteContractMutation,
} from '../services/contracts/contracts.service';
import Button from './Button';
import CardBody from './CardBody';
import CardHeader from './CardHeader';
import ConfirmationModal from './ConfirmationModal';
import DataTableComponent, { useNarrowScreen } from './DataTableComponent';
import LinkCell from './LinkCell';
import Popover from './Popover';
import Select, { SelectItem } from './Select';
import StatusBadge, { BadgeTone } from './StatusBadge';
import InitialsAvatar from './InitialsAvatar';
import UploadContractModal from './UploadContractModal';
import GenerateCertificateModal from './GenerateCertificateModal';

// #489: the Contracts page filters by status only
export const ContractStatusOptions: SelectItem<ContractFilterStatus>[] = [
  ...Object.values(ContractStatus).map((status) => ({
    key: status as ContractFilterStatus,
    value: `${i18n.t(`documents:contract.status.${status}`)}`,
  })),
  { key: EXPIRING_SOON, value: `${i18n.t('documents:contract.expiring_soon')}` },
];

// #490: contracts and certificates live in the same list
export const DocumentTypeOptions: SelectItem<DocumentType>[] = Object.values(DocumentType).map(
  (type) => ({ key: type, value: `${i18n.t(`documents:contract.type.${type}`)}` }),
);

const STATUS_TONE: Record<ContractStatus, BadgeTone> = {
  [ContractStatus.SIGNED]: 'green',
  [ContractStatus.PENDING]: 'amber',
  [ContractStatus.EXPIRED]: 'gray',
};

export const ContractStatusCell = ({ row }: { row: IContractListItem }) => (
  <CellLayout>
    <StatusBadge tone={STATUS_TONE[row.status]}>
      {i18n.t(`documents:contract.status.${row.status}`)}
    </StatusBadge>
  </CellLayout>
);

// #488: "Expiră în curând" is a tag in the Perioadă column
export const ContractPeriodCell = ({ row }: { row: IContractListItem }) => (
  <CellLayout>
    <div className="flex flex-col gap-1">
      <span>
        {row.type === DocumentType.CERTIFICATE
          ? i18n.t('documents:contracts.issued_on', { date: formatDate(row.startDate) })
          : row.endDate
            ? formatDateRange(row.startDate, row.endDate)
            : i18n.t('documents:contracts.period_open', { start: formatDate(row.startDate) })}
      </span>
      {row.expiringSoon && (
        <span className="self-start rounded-md px-2 py-0.5 text-xs font-robotoMedium text-figure-amber ring-1 ring-inset ring-figure-amber">
          {i18n.t('documents:contract.expiring_soon')}
        </span>
      )}
    </div>
  </CellLayout>
);

const numberColumn: TableColumn<IContractListItem> = {
  id: 'contractNumber',
  // the type and number are on the document itself: laptops keep room for the actions
  hide: 1300,
  name: i18n.t('documents:page.headers.document'),
  sortable: true,
  minWidth: '10rem',
  cell: (row) => (
    <CellLayout>
      <div className="flex flex-col gap-0.5">
        <span className="font-robotoMedium text-cool-gray-900">
          {i18n.t(`documents:contract.type.${row.type ?? DocumentType.CONTRACT}`)}
        </span>
        <span className="text-xs text-cool-gray-500">
          {row.contractNumber
            ? i18n.t('documents:page.number', { number: row.contractNumber })
            : i18n.t('documents:page.no_number')}
        </span>
      </div>
    </CellLayout>
  ),
};

const volunteerColumn: TableColumn<IContractListItem> = {
  id: 'volunteer',
  name: i18n.t('documents:page.headers.volunteer'),
  grow: 2,
  minWidth: '13rem',
  cell: (row) => (
    <CellLayout>
      <div className="flex items-center gap-3 min-w-0">
        <InitialsAvatar name={row.volunteer.name} />
        <div className="flex flex-col min-w-0">
          <LinkCell href={`/volunteers/${row.volunteer.id}`}>{row.volunteer.name}</LinkCell>
          {row.volunteerEmail && (
            <span className="text-xs text-cool-gray-500 truncate">{row.volunteerEmail}</span>
          )}
        </div>
      </div>
    </CellLayout>
  ),
};

const statusColumn: TableColumn<IContractListItem> = {
  id: 'status',
  name: i18n.t('documents:page.headers.status'),
  minWidth: '9rem',
  cell: (row) => <ContractStatusCell row={row} />,
};

const periodColumn: TableColumn<IContractListItem> = {
  id: 'startDate',
  hide: Media.MD,
  name: i18n.t('documents:page.headers.period'),
  minWidth: '14rem',
  sortable: true,
  cell: (row) => <ContractPeriodCell row={row} />,
};

interface ContractsTableProps extends ContractsTableBasicProps {
  // #486: on the volunteer's profile: no volunteer column and no filters
  volunteerId?: string;
  // An inactive or blocked volunteer's contracts are read-only
  readOnly?: boolean;
  // On "Contracte și documente" the buttons go in the page header
  renderHeader?: (actions: ReactNode) => ReactNode;
}

const ContractsTable = ({
  query,
  setQuery,
  volunteerId,
  readOnly,
  renderHeader,
}: ContractsTableProps) => {
  const { t } = useTranslation('documents');
  const narrow = useNarrowScreen();
  const [showUpload, setShowUpload] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [toDelete, setToDelete] = useState<IContractListItem | null>(null);
  const { mutate: deleteContract, isLoading: isDeleting } = useDeleteContractMutation();
  const queryClient = useQueryClient();

  const params = {
    orderBy: query?.orderBy as string | undefined,
    orderDirection: query?.orderDirection as OrderDirection | undefined,
    status: volunteerId ? undefined : (query?.status as ContractStatus | undefined),
    type: volunteerId ? undefined : (query?.type as DocumentType | undefined),
    search: volunteerId ? undefined : (query?.search as string | undefined) || undefined,
    volunteerId,
  };
  const [search, setSearch] = useState<string>((query?.search as string) || '');

  // the search waits for a short pause in typing before it reaches the URL and the API
  useEffect(() => {
    if (volunteerId || search === ((query?.search as string) || '')) return;
    const timeout = setTimeout(() => setQuery({ search: search || undefined, page: 1 }), 400);
    return () => clearTimeout(timeout);
  }, [search]);
  const {
    data: contracts,
    isLoading,
    error,
    refetch: refetchList,
  } = useContractsQuery({
    ...params,
    limit: query?.limit as number,
    page: query?.page as number,
  });

  // the counters on top of the page follow every upload and delete
  const refetch = () => {
    refetchList();
    queryClient.invalidateQueries(['contracts-counters']);
  };

  useEffect(() => {
    if (error)
      useErrorToast(InternalErrors.CONTRACT_ERRORS.getError(error.response?.data.code_error));
  }, [error]);

  const onExport = async () => {
    const { data } = await getContractsForDownload(params);
    downloadExcel(data as BlobPart, t('contracts.download'));
  };

  const confirmDelete = () => {
    if (!toDelete) return;
    const id = toDelete.id;
    setToDelete(null);
    deleteContract(id, {
      onSuccess: () => {
        useSuccessToast(t('contract.submit.delete'));
        refetch();
      },
      onError: (error) =>
        useErrorToast(InternalErrors.CONTRACT_ERRORS.getError(error.response?.data.code_error)),
    });
  };

  const actionColumn: TableColumn<IContractListItem> = {
    name: i18n.t('documents:page.headers.actions'),
    // phones: icon buttons (the names stay for screen readers), so the volunteer keeps room
    minWidth: narrow ? '8rem' : '13rem',
    right: true,
    allowOverflow: true,
    cell: (row) => (
      <div className="flex items-center justify-end gap-1 !overflow-visible">
        <a
          href={row.uri}
          target="_blank"
          rel="noreferrer"
          className="flex shrink-0 items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm font-robotoMedium text-cool-gray-700 whitespace-nowrap hover:bg-cool-gray-100 hover:text-cool-gray-900"
        >
          <EyeIcon className="w-4 h-4" aria-hidden="true" />
          <span className="sr-only sm:not-sr-only">{t('page.view')}</span>
        </a>
        <button
          type="button"
          aria-label={`${t('page.pdf')} ${row.fileName}`}
          className="flex shrink-0 items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm font-robotoMedium text-cool-gray-700 whitespace-nowrap hover:bg-cool-gray-100 hover:text-cool-gray-900"
          onClick={() => downloadFile(row.uri, row.fileName)}
        >
          <ArrowDownTrayIcon className="w-4 h-4" aria-hidden="true" />
          <span className="sr-only sm:not-sr-only">{t('page.pdf')}</span>
        </button>
        {!readOnly && (
          <Popover<IContractListItem>
            row={row}
            items={[
              {
                label: t('popover.remove'),
                icon: <TrashIcon className="menu-icon" />,
                alert: true,
                onClick: setToDelete,
              },
            ]}
          />
        )}
      </div>
    ),
  };

  const columns = volunteerId
    ? [numberColumn, statusColumn, periodColumn, actionColumn]
    : [volunteerColumn, numberColumn, periodColumn, statusColumn, actionColumn];

  const onSort = (column: TableColumn<IContractListItem>, direction: SortOrder) =>
    setQuery({
      orderBy: column.id as string,
      orderDirection:
        direction.toLocaleUpperCase() === OrderDirection.ASC
          ? OrderDirection.ASC
          : OrderDirection.DESC,
    });

  const actions = (
    <>
      {!readOnly && (
        <Button
          label={t('contracts.actions.certificate')}
          className="btn-outline-secondary"
          icon={<DocumentTextIcon className="h-5 w-5" />}
          onClick={() => setShowCertificate(true)}
        />
      )}
      {!readOnly && (
        <Button
          label={t('contracts.actions.upload')}
          className="btn-primary"
          icon={<ArrowUpTrayIcon className="h-5 w-5" />}
          onClick={() => setShowUpload(true)}
        />
      )}
    </>
  );

  return (
    <>
      {renderHeader?.(actions)}
      {!volunteerId && (
        <Card>
          <CardHeader>
            <div>
              <h2>{t('page.filters.title')}</h2>
              <p className="text-sm text-cool-gray-500">{t('page.filters.subtitle')}</p>
            </div>
          </CardHeader>
          <CardBody>
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="relative flex-1">
                <MagnifyingGlassIcon
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cool-gray-400"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  aria-label={t('page.filters.search')}
                  placeholder={t('page.filters.search')}
                  className="w-full max-w-none pl-10"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
              <div className="w-full lg:w-56">
                <Select
                  options={ContractStatusOptions}
                  onChange={(item: SelectItem<ContractFilterStatus> | undefined) =>
                    setQuery({ status: item?.key, page: 1 })
                  }
                  placeholder={t('page.filters.all_statuses')}
                  ariaLabel={t('contracts.filters.status')}
                  allowDeselect
                  selected={ContractStatusOptions.find((option) => option.key === query?.status)}
                />
              </div>
              <div className="w-full lg:w-56">
                <Select
                  options={DocumentTypeOptions}
                  onChange={(item: SelectItem<DocumentType> | undefined) =>
                    setQuery({ type: item?.key, page: 1 })
                  }
                  placeholder={t('page.filters.all_types')}
                  ariaLabel={t('contracts.filters.type')}
                  allowDeselect
                  selected={DocumentTypeOptions.find((option) => option.key === query?.type)}
                />
              </div>
            </div>
            {/* the export sits with the results, as on every list (audit m17) */}
            <div className="mt-4 pt-4 border-t border-cool-gray-200 flex flex-wrap items-center justify-between gap-3 text-sm text-cool-gray-600">
              <span>{t('page.filters.found', { count: contracts?.meta.totalItems ?? 0 })}</span>
              <Button
                label={t('contracts.actions.download')}
                className="btn-text-primary px-2"
                icon={<ArrowDownTrayIcon className="h-5 w-5 text-cool-gray-600" />}
                onClick={onExport}
              />
            </div>
          </CardBody>
        </Card>
      )}
      <Card>
        {(volunteerId || !renderHeader) && (
          <CardHeader>
            <h2>{t('contracts.statistics.total', { total: contracts?.meta.totalItems ?? 0 })}</h2>
            <div className="flex gap-2 lg:gap-6">{actions}</div>
          </CardHeader>
        )}
        <CardBody>
          <DataTableComponent
            columns={columns}
            empty={
              volunteerId || query?.search || query?.status || query?.type
                ? undefined
                : {
                    title: t('contracts.empty.title'),
                    description: t('contracts.empty.description'),
                    action: !readOnly && (
                      <Button
                        label={t('contracts.actions.upload')}
                        className="btn-primary"
                        icon={<ArrowUpTrayIcon className="h-5 w-5" />}
                        onClick={() => setShowUpload(true)}
                      />
                    ),
                  }
            }
            data={contracts?.items}
            loading={isLoading || isDeleting}
            error={error}
            onRetry={refetchList}
            pagination
            paginationPerPage={query?.limit}
            paginationTotalRows={contracts?.meta?.totalItems}
            paginationDefaultPage={query?.page}
            onChangeRowsPerPage={(rows: number) => setQuery({ limit: rows, page: 1 })}
            onChangePage={(page: number) => setQuery({ page })}
            onSort={onSort}
          />
        </CardBody>
      </Card>
      {showUpload && (
        <UploadContractModal
          volunteerId={volunteerId}
          onClose={(saved) => {
            setShowUpload(false);
            if (saved) refetch();
          }}
        />
      )}
      {showCertificate && (
        <GenerateCertificateModal
          volunteerId={volunteerId}
          onClose={() => setShowCertificate(false)}
        />
      )}
      {toDelete && (
        <ConfirmationModal
          title={t('contract.delete_modal.title')}
          description={t('contract.delete_modal.description')}
          confirmBtnLabel={t('general:delete')}
          onClose={() => setToDelete(null)}
          onConfirm={confirmDelete}
          confirmBtnClassName="btn-danger"
        />
      )}
    </>
  );
};

export default ContractsTable;
