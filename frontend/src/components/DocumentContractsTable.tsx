import React, { useMemo, useState } from 'react';
import DataTableComponent from './DataTableComponent';
import CardHeader from './CardHeader';
import CardBody from './CardBody';
import Card from '../layouts/CardLayout';
import { IHOCQueryProps } from '../common/interfaces/hoc-query-props.interface';
import i18n from '../common/config/i18n';
import { ArrowDownTrayIcon, EyeIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { SortOrder, TableColumn } from 'react-data-table-component';
import { OrderDirection } from '../common/enums/order-direction.enum';
import Popover from './Popover';
import Button from './Button';
import {
  DocumentContractStatusMarkerColorMapper,
  downloadFile,
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
import {
  useDeleteDocumentContractMutation,
  useGetContractsStatisticsQuery,
  useGetDocumentsContractsQuery,
} from '../services/document-contracts/document-contracts.service';
import { DocumentContractStatusForFilter } from '../common/enums/document-contract-status.enum';
import { IPaginationQueryParams } from '../common/constants/pagination';

import {
  IDocumentContract,
  IDocumentContractsStatistics,
} from '../common/interfaces/document-contract.interface';
import DocumentsContractSidePanel from './DocumentsContractSidePanel';
import VolunteerSelect from '../containers/VolunteerSelect';
import { ListItem } from '../common/interfaces/list-item.interface';
import { SelectItem } from './Select';
import SelectFilter from '../containers/SelectFilter';
import ConfirmationModal from './ConfirmationModal';
import { useErrorToast, useSuccessToast } from '../hooks/useToast';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { ContractsStatistics } from './ContractsStatistics';
import { useQueryClient } from 'react-query';

interface StatusOption {
  key: string;
  internalValue: DocumentContractStatusForFilter;
  value: string;
}

const StatusOptions = Object.values(DocumentContractStatusForFilter).flatMap((status: string) => {
  return [
    {
      key: status,
      value: i18n.t(`document_contract:contract.status.${status}`),
      internalValue: status,
    },
  ];
});

const ContractsTableHeader = [
  {
    id: 'documentNumber',
    name: i18n.t('documents:contracts.headers.contract_number'),
    sortable: true,
    selector: (row: IDocumentContract) => row.documentNumber,
  },
  {
    id: 'volunteerName',
    name: i18n.t('documents:contracts.headers.volunteer'),
    grow: 2,
    sortable: true,
    cell: (row: IDocumentContract) => (
      <LinkCell href={`/volunteers/${row.volunteerId}`}>{row.volunteerName}</LinkCell>
    ),
  },
  {
    id: 'documentStartDate',
    name: i18n.t('documents:contracts.headers.start_date'),
    sortable: true,
    selector: (row: IDocumentContract) => formatDate(row.documentStartDate),
  },
  {
    id: 'documentEndDate',
    name: i18n.t('documents:contracts.headers.end_date'),
    sortable: true,
    selector: (row: IDocumentContract) => formatDate(row.documentEndDate),
  },
  {
    id: 'status',
    name: i18n.t('documents:contracts.headers.status'),
    minWidth: '11rem',
    sortable: true,
    cell: (row: IDocumentContract) => {
      return (
        <CellLayout>
          <StatusWithMarker markerColor={DocumentContractStatusMarkerColorMapper[row.status]}>
            {i18n.t(`document_contract:contract.status.${row.status}`)}
          </StatusWithMarker>
        </CellLayout>
      );
    },
  },
];

export interface DocumentContractsTableQueryProps extends IPaginationQueryParams {
  volunteerId?: string;
  volunteerName?: string;
  search?: string;
  startDate?: Date;
  endDate?: Date;
  status?: DocumentContractStatusForFilter;
  activeTab?: VolunteerTabsOptions;
}

type DocumentContractsTableBasicProps = IHOCQueryProps<DocumentContractsTableQueryProps>;

const DocumentContractsTable = ({ query, setQuery }: DocumentContractsTableBasicProps) => {
  const queryClient = useQueryClient();

  // selected contract id
  const [selectedContract, setSelectedContract] = useState<string>();
  const [selectedVolunteer, setSelectedVolunteer] = useState<ListItem>();
  const [selectedDeleteContract, setSelectedDeleteContract] = useState<null | IDocumentContract>(
    null,
  );
  // side panel state
  const [isViewContractSidePanelOpen, setIsViewContractSidePanelOpen] = useState<boolean>(false);
  // translation
  const { t } = useTranslation('documents');
  // navigation
  const navigate = useNavigate();

  const {
    data: contracts,
    isLoading: isLoadingContracts,
    refetch,
  } = useGetDocumentsContractsQuery({
    page: query?.page as number,
    limit: query?.limit as number,
    search: query?.search,
    orderBy: query?.orderBy as string,
    orderDirection: query?.orderDirection as OrderDirection,
    volunteerId: query?.volunteerId as string,
    status: query?.status as DocumentContractStatusForFilter,
    ...(query.startDate
      ? { documentStartDate: formatDate(query?.startDate as Date, 'yyyy-MM-dd') }
      : {}),
    ...(query.endDate ? { documentEndDate: formatDate(query?.endDate as Date, 'yyyy-MM-dd') } : {}),
  });

  const { data: statistics, isLoading: isLoadingStatistics } = useGetContractsStatisticsQuery();

  const { mutate: deleteContract } = useDeleteDocumentContractMutation();

  const onView = (row: IDocumentContract) => {
    setSelectedContract(row.documentId);
    setIsViewContractSidePanelOpen(true);
  };

  const showDeleteContractModal = (row: IDocumentContract) => {
    setSelectedDeleteContract(row);
  };

  const confirmDelete = () => {
    if (selectedDeleteContract) {
      const contractId = selectedDeleteContract.documentId;
      deleteContract(contractId, {
        onSuccess: () => {
          useSuccessToast(t('contract.submit.delete'));
          setSelectedDeleteContract(null);
          queryClient.invalidateQueries({ queryKey: ['contracts-statistics'] });
          refetch();
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => {
          useErrorToast(InternalErrors.CONTRACT_ERRORS.getError(error?.response?.data.code_error));
        },
      });
    }
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
        onClick: (contract: IDocumentContract) => {
          if (contract.documentFilePath) {
            downloadFile(
              contract.documentFilePath,
              contract.documentFilePath?.split('/').pop() || 'contract.pdf',
            );
          }
        },
      },
    ];

    const deleteContractsMenuItems = [
      ...contractsMenuItems,
      {
        label: t('general:delete'),
        icon: <TrashIcon className="menu-icon" />,
        onClick: showDeleteContractModal,
        alert: true,
      },
    ];

    const mapContractStatusToPopoverItems = (status: DocumentContractStatusForFilter) => {
      switch (status) {
        case DocumentContractStatusForFilter.SCHEDULED:
        case DocumentContractStatusForFilter.CREATED:
        case DocumentContractStatusForFilter.PENDING_VOLUNTEER_SIGNATURE:
          return deleteContractsMenuItems;
        case DocumentContractStatusForFilter.ACTION_EXPIRED:
        case DocumentContractStatusForFilter.REJECTED_NGO:
        case DocumentContractStatusForFilter.REJECTED_VOLUNTEER:
        case DocumentContractStatusForFilter.PENDING_APPROVAL_NGO:
        case DocumentContractStatusForFilter.PENDING_NGO_REPRESENTATIVE_SIGNATURE:
        case DocumentContractStatusForFilter.ACTIVE:
        case DocumentContractStatusForFilter.NOT_STARTED:
        case DocumentContractStatusForFilter.EXPIRED:
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
    return ContractsTableHeader;
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
    navigate(`generate`);
  };

  const onStartDateChange = (startDate: Date | null) => {
    setQuery({ startDate: startDate as Date });
  };

  const onEndDateChange = (endDate: Date | null) => {
    setQuery({ endDate: endDate as Date });
  };

  const onVolunteerChange = (volunteer: ListItem) => {
    setSelectedVolunteer(volunteer);
    setQuery({ volunteerId: volunteer.value });
  };

  const onResetFilters = () => {
    setSelectedVolunteer(undefined);
    setQuery({}, 'push');
  };

  const onSearch = (search: string) => {
    setQuery({
      search,
    });
  };

  const onStatusChange = (item: StatusOption) => {
    setQuery({ status: item?.internalValue as DocumentContractStatusForFilter });
  };

  // todo: do we need shouldRefetch?
  const onCloseSidePanel = () => {
    setIsViewContractSidePanelOpen(false);
    setSelectedContract(undefined);
  };

  const expandOnStatsFiltersChange = useMemo(() => {
    // These fields are changed on "view more" button on contracts stats => we want to expand the filters when applied.
    if (query.status || query.endDate) {
      return true;
    }
    return false;
  }, [query.status, query.endDate]);

  return (
    <>
      <ContractsStatistics
        statistics={statistics as IDocumentContractsStatistics}
        isLoading={isLoadingStatistics}
        setQuery={setQuery}
      />
      <DataTableFilters
        onSearch={onSearch}
        searchValue={query?.search}
        onResetFilters={onResetFilters}
        isExpanded={expandOnStatsFiltersChange}
      >
        {
          <VolunteerSelect
            label={t('general:volunteer')}
            defaultValue={
              query.volunteerId && selectedVolunteer
                ? { value: query.volunteerId, label: selectedVolunteer?.label }
                : undefined
            }
            onSelect={onVolunteerChange}
          />
        }
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
        <SelectFilter
          options={StatusOptions as SelectItem<string>[]}
          onChange={onStatusChange as (item: SelectItem<string> | undefined) => void}
          placeholder={`${t('general:select', { item: '' })}`}
          label={`${t('contracts.filters.status')}`}
          defaultValue={query.status}
          allowDeselect
        />
      </DataTableFilters>
      <Card>
        <CardHeader>
          <h2>{t('contracts.statistics.total', { total: contracts?.meta.totalItems })}</h2>
          <div className="flex gap-2 lg:gap-6">
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
            onRowClicked={onView}
          />
        </CardBody>
      </Card>
      <DocumentsContractSidePanel
        onClose={onCloseSidePanel}
        isOpen={isViewContractSidePanelOpen}
        contractId={selectedContract}
      />
      {selectedDeleteContract && (
        <ConfirmationModal
          title={t('contract.delete_modal.title')}
          description={t('contract.delete_modal.description')}
          confirmBtnLabel={t('general:delete')}
          onClose={setSelectedDeleteContract.bind(null, null)}
          onConfirm={confirmDelete}
          confirmBtnClassName="btn-danger"
        />
      )}
    </>
  );
};

export default DocumentContractsTable;
