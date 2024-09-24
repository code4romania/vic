import React, { useState } from 'react';
import DataTableComponent from './DataTableComponent';
import CardHeader from './CardHeader';
import CardBody from './CardBody';
import Card from '../layouts/CardLayout';
import { IContractListItem } from '../common/interfaces/contract.interface';
import { IHOCQueryProps } from '../common/interfaces/hoc-query-props.interface';
import i18n from '../common/config/i18n';
import { ArrowDownTrayIcon, EyeIcon, PlusIcon } from '@heroicons/react/24/outline';
import { SortOrder, TableColumn } from 'react-data-table-component';
import { OrderDirection } from '../common/enums/order-direction.enum';
import Popover from './Popover';
import Button from './Button';
import {
  ContractStatusMarkerColorMapper,
  downloadExcel,
  // downloadFile,
  formatDate,
} from '../common/utils/utils';
import LinkCell from './LinkCell';
import CellLayout from '../layouts/CellLayout';
import StatusWithMarker from './StatusWithMarker';
import DataTableFilters from './DataTableFilters';
import FormDatePicker from './FormDatePicker';
import { useNavigate } from 'react-router-dom';
import { VolunteerTabsOptions } from '../pages/Volunteer';
import { useTranslation } from 'react-i18next';
import { getContractsForDownload } from '../services/contracts/contracts.api';
import { useGetDocumentsContractsQuery } from '../services/document-contracts/document-contracts.service';
import { DocumentContractStatus } from '../common/enums/document-contract-status.enum';
import { IPaginationQueryParams } from '../common/constants/pagination';
import { IDocumentContract } from '../common/interfaces/document-contract.interface';
import DocumentsContractSidePanel from './DocumentsContractSidePanel';

// const StatusOptions: SelectItem<ContractStatus>[] = [
//   {
//     key: ContractStatus.ACTIVE,
//     value: `${i18n.t(`documents:contract.status.${ContractStatus.ACTIVE}`)}`,
//   },
//   {
//     key: ContractStatus.CLOSED,
//     value: `${i18n.t(`documents:contract.status.${ContractStatus.CLOSED}`)}`,
//   },
//   {
//     key: ContractStatus.NOT_STARTED,
//     value: `${i18n.t(`documents:contract.status.${ContractStatus.NOT_STARTED}`)}`,
//   },
//   {
//     key: ContractStatus.REJECTED,
//     value: `${i18n.t(`documents:contract.status.${ContractStatus.REJECTED}`)}`,
//   },
//   {
//     key: ContractStatus.PENDING_ADMIN,
//     value: `${i18n.t(`documents:contract.status.${ContractStatus.PENDING_ADMIN}`)}`,
//   },
//   {
//     key: ContractStatus.PENDING_VOLUNTEER,
//     value: `${i18n.t(`documents:contract.status.${ContractStatus.PENDING_VOLUNTEER}`)}`,
//   },
// ];

const ContractsTableHeader = [
  {
    id: 'contractNumber',
    name: i18n.t('documents:contracts.headers.contract_number'),
    sortable: true,
    selector: (row: IDocumentContract) => row.documentNumber,
  },
  {
    id: 'volunteer',
    name: i18n.t('documents:contracts.headers.volunteer'),
    grow: 2,
    sortable: true,
    cell: (row: IDocumentContract) => (
      <LinkCell href={`/volunteers/${row.volunteerId}`}>{row.volunteerName}</LinkCell>
    ),
  },
  {
    id: 'startDate',
    name: i18n.t('documents:contracts.headers.start_date'),
    sortable: true,
    selector: (row: IDocumentContract) => formatDate(row.documentStartDate),
  },
  {
    id: 'endDate',
    name: i18n.t('documents:contracts.headers.end_date'),
    sortable: true,
    selector: (row: IDocumentContract) => formatDate(row.documentEndDate),
  },
  {
    id: 'status',
    name: i18n.t('documents:contracts.headers.status'),
    minWidth: '11rem',
    sortable: true,
    cell: (row: IDocumentContract) => (
      <CellLayout>
        <StatusWithMarker markerColor={ContractStatusMarkerColorMapper[row.status]}>
          {i18n.t(`documents:contract.status.${row.status}`)}
        </StatusWithMarker>
      </CellLayout>
    ),
  },
];

const VolunteerContractsTableHeader = [
  {
    id: 'contractNumber',
    name: i18n.t('documents:contracts.headers.contract_number'),
    sortable: true,
    grow: 3,
    selector: (row: IContractListItem) => row.contractNumber,
  },
  {
    id: 'status',
    name: i18n.t('documents:contracts.headers.status'),
    minWidth: '11rem',
    sortable: true,
    cell: (row: IContractListItem) => (
      <CellLayout>
        <StatusWithMarker markerColor={ContractStatusMarkerColorMapper[row.status]}>
          {i18n.t(`documents:contract.status.${row.status}`)}
        </StatusWithMarker>
      </CellLayout>
    ),
  },
  {
    id: 'startDate',
    name: i18n.t('documents:contracts.headers.start_date'),
    sortable: true,
    selector: (row: IContractListItem) => formatDate(row.startDate),
  },
  {
    id: 'endDate',
    name: i18n.t('documents:contracts.headers.end_date'),
    sortable: true,
    selector: (row: IContractListItem) => formatDate(row.endDate),
  },
];

interface DocumentContractsTableQueryProps extends IPaginationQueryParams {
  volunteerId?: string;
  search?: string;
  startDate?: Date;
  endDate?: Date;
  status?: DocumentContractStatus;
  activeTab?: VolunteerTabsOptions;
}

type DocumentContractsTableBasicProps = IHOCQueryProps<DocumentContractsTableQueryProps>;
interface DocumentContractsTableProps extends DocumentContractsTableBasicProps {
  volunteerName?: string;
  volunteerId?: string;
}

const ContractsTable = ({
  query,
  setQuery,
  volunteerName,
  volunteerId,
}: DocumentContractsTableProps) => {
  // selected contract id
  const [selectedContract, setSelectedContract] = useState<string>();
  // side panel state
  const [isViewContractSidePanelOpen, setIsViewContractSidePanelOpen] = useState<boolean>(false);
  // translation
  const { t } = useTranslation('documents');
  // navigation
  const navigate = useNavigate();

  const { data: contracts, isLoading: isLoadingContracts } = useGetDocumentsContractsQuery({
    page: query?.page as number,
    limit: query?.limit as number,
    search: query?.search,
    orderBy: query?.orderBy as string,
    orderDirection: query?.orderDirection as OrderDirection,
    volunteerId,
    status: query?.status as DocumentContractStatus,
  });

  const onView = (row: IDocumentContract) => {
    setSelectedContract(row.documentId);
    setIsViewContractSidePanelOpen(true);
  };

  const onExport = async () => {
    const { data } = await getContractsForDownload({
      orderBy: query?.orderBy as string,
      orderDirection: query?.orderDirection as OrderDirection,
      search: query?.search,
      // volunteerName: query?.volunteer,
      startDate: query?.startDate,
      endDate: query?.endDate,
      // status: query?.status as ContractStatus,
      volunteerId,
    });

    downloadExcel(data as BlobPart, t('contracts.download'));
  };

  const buildContractActionColumn = (): TableColumn<IDocumentContract> => {
    const contractsMenuItems = [
      {
        label: t('events:popover.view'),
        icon: <EyeIcon className="menu-icon" />,
        onClick: onView,
      },
      {
        label: t('general:download', { item: i18n.t('general:contract').toLowerCase() }),
        icon: <ArrowDownTrayIcon className="menu-icon" />,
        // todo: download contract
        // onClick: onDownloadContract,
      },
    ];

    const mapContractStatusToPopoverItems = (status: DocumentContractStatus) => {
      switch (status) {
        case DocumentContractStatus.APPROVED:
        case DocumentContractStatus.SCHEDULED:
        case DocumentContractStatus.ACTION_EXPIRED:
        case DocumentContractStatus.REJECTED_NGO:
        case DocumentContractStatus.REJECTED_VOLUNTEER:
        case DocumentContractStatus.CREATED:
        case DocumentContractStatus.PENDING_APPROVAL_NGO:
        case DocumentContractStatus.PENDING_NGO_REPRESENTATIVE_SIGNATURE:
        case DocumentContractStatus.PENDING_VOLUNTEER_SIGNATURE:
          return contractsMenuItems;
        default:
          return [];
      }
    };

    return {
      name: '',
      cell: (row: IDocumentContract) => (
        <Popover<IDocumentContract> row={row} items={mapContractStatusToPopoverItems(row.status)} />
      ),
      width: '50px',
      allowOverflow: true,
    };
  };

  const buildContractTableHeader = (): TableColumn<IDocumentContract>[] => {
    return volunteerName ? VolunteerContractsTableHeader : ContractsTableHeader;
  };

  // pagination
  const onRowsPerPageChange = (rows: number) => {
    setQuery({
      limit: rows,
      page: 1,
    });
  };

  const onChangePage = (newPage: number) => {
    setQuery({
      page: newPage,
    });
  };

  const onSort = (column: TableColumn<IDocumentContract>, direction: SortOrder) => {
    setQuery({
      orderBy: column.id as string,
      orderDirection:
        direction.toLocaleUpperCase() === OrderDirection.ASC
          ? OrderDirection.ASC
          : OrderDirection.DESC,
    });
  };

  // const onDownloadContract = (row: IContractListItem) => {
  //   downloadFile(row.uri, row.fileName);
  // };

  const onAddContract = () => {
    navigate(`/documents/templates/contracts/generate`);
  };

  const onStartDateChange = (startDate: Date | null) => {
    setQuery({ startDate: startDate as Date });
  };

  const onEndDateChange = (endDate: Date | null) => {
    setQuery({ endDate: endDate as Date });
  };

  // const onVolunteerChange = (volunteer: ListItem) => {
  //   setQuery({ volunteer: volunteer.label });
  // };

  const onResetFilters = () => {
    if (volunteerName) {
      setQuery({ activeTab: VolunteerTabsOptions.DOCUMENTS }, 'push');
    } else {
      setQuery({}, 'push');
    }
  };

  const onSearch = (search: string) => {
    setQuery({
      search,
    });
  };

  // const onStatusChange = (item: SelectItem<ContractStatus> | undefined) => {
  //   setQuery({ status: item?.key });
  // };

  // const onCloseSidePanel = (shouldRefetch?: boolean) => {
  //   setIsViewContractSidePanelOpen(false);
  //   setSelectedContract(undefined);
  //   if (shouldRefetch) refetch();
  // };

  // todo: do we need shouldRefetch?
  const onCloseSidePanel = () => {
    setIsViewContractSidePanelOpen(false);
    setSelectedContract(undefined);
  };

  // const confirmReject = (rejectMessage?: string) => {
  //   if (showRejectContract)
  //     rejectContract(
  //       {
  //         id: showRejectContract.id,
  //         rejectMessage,
  //       },
  //       {
  //         onSuccess: () => {
  //           useSuccessToast(t('contract.submit.reject'));
  //           // refetch();
  //         },
  //         onError: (error) => {
  //           useErrorToast(InternalErrors.CONTRACT_ERRORS.getError(error.response?.data.code_error));
  //         },
  //         onSettled: () => {
  //           setShowRejectContract(null);
  //         },
  //       },
  //     );
  // };

  // const confirmDelete = () => {
  //   if (showDeleteContract) {
  //     const contractId = showDeleteContract.id;
  //     setShowDeleteContract(null);
  //     deleteContract(contractId, {
  //       onSuccess: () => {
  //         useSuccessToast(t('contract.submit.delete'));
  //         // refetch();
  //       },
  //       onError: (error) => {
  //         useErrorToast(InternalErrors.CONTRACT_ERRORS.getError(error.response?.data.code_error));
  //       },
  //     });
  //   }
  // };

  // const onConfirmSign = (contract?: File) => {
  //   if (!contract) return;

  //   // store id and close modal
  //   const contractId = showApproveContract?.id;
  //   setShowApproveContract(null);

  //   // approval process
  //   approveContract(
  //     {
  //       id: contractId as string,
  //       contract,
  //     },
  //     {
  //       onSuccess: () => {
  //         useSuccessToast(t('contract.submit.confirm'));
  //       },
  //       onError: (error) => {
  //         useErrorToast(InternalErrors.CONTRACT_ERRORS.getError(error.response?.data.code_error));
  //       },
  //     },
  //   );
  // };

  return (
    <>
      <DataTableFilters
        onSearch={onSearch}
        searchValue={query?.search}
        onResetFilters={onResetFilters}
      >
        {/* {!volunteerName && (
          <VolunteerSelect
            label={t('volunteer:name', { status: '' })}
            defaultValue={query.volunteer ? { value: '', label: query.volunteer } : undefined}
            onSelect={onVolunteerChange}
          />
        )} */}
        <FormDatePicker
          label={`${t('contracts.filters.start_date')}`}
          placeholder={`${t('general:anytime')}`}
          onChange={onStartDateChange}
          value={query.startDate}
        />
        <FormDatePicker
          label={`${t('contracts.filters.end_date')}`}
          placeholder={`${t('general:anytime')}`}
          onChange={onEndDateChange}
          value={query.endDate}
        />
        {/* <Select
          options={StatusOptions}
          onChange={onStatusChange}
          placeholder={`${t('general:select', { item: '' })}`}
          label={`${t('contracts.filters.status')}`}
          selected={StatusOptions.find((option) => option.key === query.status)}
        /> */}
      </DataTableFilters>
      <Card>
        <CardHeader>
          <h2>{t('contracts.statistics.total', { total: contracts?.meta.totalItems })}</h2>
          <div className="flex gap-2 lg:gap-6">
            <Button
              label={t('contracts.actions.download')}
              className="btn-outline-secondary"
              icon={<ArrowDownTrayIcon className="h-5 w-5" />}
              onClick={onExport}
            />
            <Button
              label={t('contracts.actions.add')}
              className="btn-primary"
              icon={<PlusIcon className="h-5 w-5" />}
              onClick={onAddContract}
            />
          </div>
        </CardHeader>
        <CardBody>
          <DataTableComponent<IDocumentContract>
            columns={[...buildContractTableHeader(), buildContractActionColumn()]}
            data={contracts?.items}
            // todo: more loading stuff here while doing actions
            loading={isLoadingContracts}
            pagination
            paginationPerPage={query.limit}
            paginationTotalRows={contracts?.meta?.totalItems}
            paginationDefaultPage={query.page}
            onChangeRowsPerPage={onRowsPerPageChange}
            onChangePage={onChangePage}
            onSort={onSort}
          />
        </CardBody>
        {/* {showRejectContract && (
          <RejectTextareaModal
            label={t('contract.reject_modal.description')}
            title={t('contract.reject_modal.title')}
            onClose={setShowRejectContract.bind(null, null)}
            onConfirm={confirmReject}
            secondaryBtnLabel={`${t('contract.actions.reject_no_message')}`}
            primaryBtnLabel={`${t('contract.actions.reject')}`}
            primaryBtnClassName="btn-danger"
          />
        )} */}
        {/* {showDeleteContract && (
          <ConfirmationModal
            title={t('contract.delete_modal.title')}
            description={t('contract.delete_modal.description')}
            confirmBtnLabel={t('general:delete')}
            onClose={setShowDeleteContract.bind(null, null)}
            onConfirm={confirmDelete}
            confirmBtnClassName="btn-danger"
          />
        )} */}
        {/* {showApproveContract && (
          <UploadFileModal
            description={t('contract.upload.description')}
            title={t('contract.upload.title')}
            onClose={setShowApproveContract.bind(null, null)}
            onConfirm={onConfirmSign}
          />
        )} */}
      </Card>
      <DocumentsContractSidePanel
        onClose={onCloseSidePanel}
        isOpen={isViewContractSidePanelOpen}
        contractId={selectedContract}
      />
    </>
  );
};

export default ContractsTable;
