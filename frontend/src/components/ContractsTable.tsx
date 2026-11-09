import React, { useEffect, useState } from 'react';
import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  DocumentTextIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { SortOrder, TableColumn } from 'react-data-table-component';
import { useTranslation } from 'react-i18next';
import i18n from '../common/config/i18n';
import { ContractStatus } from '../common/enums/contract-status.enum';
import { DocumentType } from '../common/enums/document-type.enum';
import { OrderDirection } from '../common/enums/order-direction.enum';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { IContractListItem } from '../common/interfaces/contract.interface';
import {
  ContractStatusMarkerColorMapper,
  downloadExcel,
  downloadFile,
  formatDate,
} from '../common/utils/utils';
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
import DataTableComponent from './DataTableComponent';
import LinkCell from './LinkCell';
import Popover from './Popover';
import Select, { SelectItem } from './Select';
import StatusWithMarker from './StatusWithMarker';
import UploadContractModal from './UploadContractModal';
import GenerateCertificateModal from './GenerateCertificateModal';

// #489: the Contracts page filters by status only
export const ContractStatusOptions: SelectItem<ContractStatus>[] = Object.values(
  ContractStatus,
).map((status) => ({ key: status, value: `${i18n.t(`documents:contract.status.${status}`)}` }));

// #490: contracts and certificates live in the same list
export const DocumentTypeOptions: SelectItem<DocumentType>[] = Object.values(DocumentType).map(
  (type) => ({ key: type, value: `${i18n.t(`documents:contract.type.${type}`)}` }),
);

export const ContractStatusCell = ({ row }: { row: IContractListItem }) => (
  <CellLayout>
    <StatusWithMarker markerColor={ContractStatusMarkerColorMapper[row.status]}>
      {i18n.t(`documents:contract.status.${row.status}`)}
    </StatusWithMarker>
  </CellLayout>
);

// #488: "Expiră în curând" is a tag in the Perioadă column
export const ContractPeriodCell = ({ row }: { row: IContractListItem }) => (
  <CellLayout>
    <div className="flex flex-col gap-1">
      <span>
        {row.endDate
          ? `${formatDate(row.startDate)} – ${formatDate(row.endDate)}`
          : i18n.t('documents:contracts.period_open', { start: formatDate(row.startDate) })}
      </span>
      {row.expiringSoon && (
        <span className="self-start rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
          {i18n.t('documents:contract.expiring_soon')}
        </span>
      )}
    </div>
  </CellLayout>
);

const numberColumn: TableColumn<IContractListItem> = {
  id: 'contractNumber',
  name: i18n.t('documents:contracts.headers.contract_number'),
  sortable: true,
  minWidth: '9rem',
  cell: (row) => (
    <CellLayout>
      <div className="flex flex-col gap-1">
        <span>{row.contractNumber ?? '–'}</span>
        <span className="text-xs text-cool-gray-500">
          {i18n.t(`documents:contract.type.${row.type ?? DocumentType.CONTRACT}`)}
        </span>
      </div>
    </CellLayout>
  ),
};

const volunteerColumn: TableColumn<IContractListItem> = {
  id: 'volunteer',
  name: i18n.t('documents:contracts.headers.volunteer'),
  grow: 2,
  cell: (row) => <LinkCell href={`/volunteers/${row.volunteer.id}`}>{row.volunteer.name}</LinkCell>,
};

const statusColumn: TableColumn<IContractListItem> = {
  id: 'status',
  name: i18n.t('documents:contracts.headers.status'),
  minWidth: '9rem',
  cell: (row) => <ContractStatusCell row={row} />,
};

const periodColumn: TableColumn<IContractListItem> = {
  id: 'startDate',
  name: i18n.t('documents:contracts.headers.period'),
  minWidth: '14rem',
  sortable: true,
  cell: (row) => <ContractPeriodCell row={row} />,
};

interface ContractsTableProps extends ContractsTableBasicProps {
  // #486: on the volunteer's profile: no volunteer column and no filters
  volunteerId?: string;
  // An inactive or blocked volunteer's contracts are read-only
  readOnly?: boolean;
}

const ContractsTable = ({ query, setQuery, volunteerId, readOnly }: ContractsTableProps) => {
  const { t } = useTranslation('documents');
  const [showUpload, setShowUpload] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [toDelete, setToDelete] = useState<IContractListItem | null>(null);
  const { mutate: deleteContract, isLoading: isDeleting } = useDeleteContractMutation();

  const params = {
    orderBy: query?.orderBy as string | undefined,
    orderDirection: query?.orderDirection as OrderDirection | undefined,
    status: volunteerId ? undefined : (query?.status as ContractStatus | undefined),
    type: volunteerId ? undefined : (query?.type as DocumentType | undefined),
    volunteerId,
  };
  const {
    data: contracts,
    isLoading,
    error,
    refetch,
  } = useContractsQuery({
    ...params,
    limit: query?.limit as number,
    page: query?.page as number,
  });

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
    name: '',
    width: '50px',
    allowOverflow: true,
    cell: (row) => (
      <Popover<IContractListItem>
        row={row}
        items={[
          {
            label: t('general:download', {
              item: i18n
                .t(`documents:contract.type.${row.type ?? DocumentType.CONTRACT}`)
                .toLowerCase(),
            }),
            icon: <ArrowDownTrayIcon className="menu-icon" />,
            onClick: () => downloadFile(row.uri, row.fileName),
          },
          ...(readOnly
            ? []
            : [
                {
                  label: t('popover.remove'),
                  icon: <TrashIcon className="menu-icon" />,
                  alert: true,
                  onClick: setToDelete,
                },
              ]),
        ]}
      />
    ),
  };

  const columns = volunteerId
    ? [numberColumn, statusColumn, periodColumn, actionColumn]
    : [numberColumn, volunteerColumn, statusColumn, periodColumn, actionColumn];

  const onSort = (column: TableColumn<IContractListItem>, direction: SortOrder) =>
    setQuery({
      orderBy: column.id as string,
      orderDirection:
        direction.toLocaleUpperCase() === OrderDirection.ASC
          ? OrderDirection.ASC
          : OrderDirection.DESC,
    });

  return (
    <>
      {!volunteerId && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:max-w-xs">
            <Select
              options={ContractStatusOptions}
              onChange={(item: SelectItem<ContractStatus> | undefined) =>
                setQuery({ status: item?.key, page: 1 })
              }
              placeholder={`${t('general:select', { item: '' })}`}
              label={`${t('contracts.filters.status')}`}
              allowDeselect
              selected={ContractStatusOptions.find((option) => option.key === query?.status)}
            />
          </div>
          <div className="w-full sm:max-w-xs">
            <Select
              options={DocumentTypeOptions}
              onChange={(item: SelectItem<DocumentType> | undefined) =>
                setQuery({ type: item?.key, page: 1 })
              }
              placeholder={`${t('general:select', { item: '' })}`}
              label={`${t('contracts.filters.type')}`}
              allowDeselect
              selected={DocumentTypeOptions.find((option) => option.key === query?.type)}
            />
          </div>
        </div>
      )}
      <Card>
        <CardHeader>
          <h2>{t('contracts.statistics.total', { total: contracts?.meta.totalItems ?? 0 })}</h2>
          <div className="flex gap-2 lg:gap-6">
            {!volunteerId && (
              <Button
                label={t('contracts.actions.download')}
                className="btn-outline-secondary"
                icon={<ArrowDownTrayIcon className="h-5 w-5" />}
                onClick={onExport}
              />
            )}
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
          </div>
        </CardHeader>
        <CardBody>
          <DataTableComponent
            columns={columns}
            data={contracts?.items}
            loading={isLoading || isDeleting}
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
