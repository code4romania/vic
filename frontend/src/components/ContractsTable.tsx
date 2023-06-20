import React, { useEffect, useState } from 'react';
import DataTableComponent from './DataTableComponent';
import CardHeader from './CardHeader';
import CardBody from './CardBody';
import Card from '../layouts/CardLayout';
import { IContractListItem } from '../common/interfaces/contract.interface';
import i18n from '../common/config/i18n';
import {
  ArrowDownTrayIcon,
  CheckIcon,
  EyeIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { SortOrder, TableColumn } from 'react-data-table-component';
import {
  useApproveContractMutation,
  useContractsQuery,
  useDeleteContractMutation,
  useRejectContractMutation,
} from '../services/contracts/contracts.service';
import { OrderDirection } from '../common/enums/order-direction.enum';
import { ContractsTableBasicProps } from '../containers/query/ContractsTableWithQueryParams';
import Popover from './Popover';
import { useErrorToast, useSuccessToast } from '../hooks/useToast';
import { InternalErrors } from '../common/errors/internal-errors.class';
import Button from './Button';
import { ContractStatusMarkerColorMapper, formatDate } from '../common/utils/utils';
import LinkCell from './LinkCell';
import CellLayout from '../layouts/CellLayout';
import StatusWithMarker from './StatusWithMarker';
import DataTableFilters from './DataTableFilters';
import VolunteerSelect from '../containers/VolunteerSelect';
import FormDatePicker from './FormDatePicker';
import { ListItem } from '../common/interfaces/list-item.interface';
import Select, { SelectItem } from './Select';
import { ContractStatus } from '../common/enums/contract-status.enum';
import { useNavigate } from 'react-router-dom';
import ContractSidePanel from './ContractSidePanel';
import ConfirmationModal from './ConfirmationModal';
import RejectTextareaModal from './RejectTextareaModal';
import { VolunteerTabsOptions } from '../pages/Volunteer';
import { useTranslation } from 'react-i18next';

const StatusOptions: SelectItem<ContractStatus>[] = [
  {
    key: ContractStatus.ACTIVE,
    value: `${i18n.t(`documents:contract.status.${ContractStatus.ACTIVE}`)}`,
  },
  {
    key: ContractStatus.CLOSED,
    value: `${i18n.t(`documents:contract.status.${ContractStatus.CLOSED}`)}`,
  },
  {
    key: ContractStatus.NOT_STARTED,
    value: `${i18n.t(`documents:contract.status.${ContractStatus.NOT_STARTED}`)}`,
  },
  {
    key: ContractStatus.REJECTED,
    value: `${i18n.t(`documents:contract.status.${ContractStatus.REJECTED}`)}`,
  },
  {
    key: ContractStatus.PENDING_ADMIN,
    value: `${i18n.t(`documents:contract.status.${ContractStatus.PENDING_ADMIN}`)}`,
  },
  {
    key: ContractStatus.PENDING_VOLUNTEER,
    value: `${i18n.t(`documents:contract.status.${ContractStatus.PENDING_VOLUNTEER}`)}`,
  },
];

const ContractsTableHeader = [
  {
    id: 'contractNumber',
    name: i18n.t('documents:contracts.headers.contract_number'),
    sortable: true,
    selector: (row: IContractListItem) => row.contractNumber,
  },
  {
    id: 'volunteer',
    name: i18n.t('documents:contracts.headers.volunteer'),
    grow: 2,
    sortable: true,
    cell: (row: IContractListItem) => (
      <LinkCell href={`/volunteers/${row.volunteer.id}`}>{row.volunteer.name}</LinkCell>
    ),
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

interface ContractsTableProps extends ContractsTableBasicProps {
  volunteerName: string;
}

const ContractsTable = ({ query, setQuery, volunteerName }: ContractsTableProps) => {
  // selected contract id
  const [selectedContract, setSelectedContract] = useState<string>();
  // side panel state
  const [isViewContractSidePanelOpen, setIsViewContractSidePanelOpen] = useState<boolean>(false);
  // confirmation modals
  const [showRejectContract, setShowRejectContract] = useState<null | IContractListItem>(null);
  const [showDeleteContract, setShowDeleteContract] = useState<null | IContractListItem>(null);
  // translation
  const { t } = useTranslation('documents');

  const navigate = useNavigate();

  //Actions
  const { mutateAsync: deleteContract, isLoading: isDeletingContract } =
    useDeleteContractMutation();

  const { mutateAsync: approveContract, isLoading: isApprovingContract } =
    useApproveContractMutation();

  const { mutateAsync: rejectContract, isLoading: isRejectingContract } =
    useRejectContractMutation();

  const {
    data: contracts,
    isLoading: isContractsLoading,
    error,
    refetch,
  } = useContractsQuery({
    limit: query?.limit as number,
    page: query?.page as number,
    orderBy: query?.orderBy as string,
    orderDirection: query?.orderDirection as OrderDirection,
    search: query?.search,
    volunteerName: query?.volunteer,
    startDate: query?.startDate,
    endDate: query?.endDate,
    status: query?.status as ContractStatus,
  });

  // query error handling
  useEffect(() => {
    if (error)
      useErrorToast(InternalErrors.CONTRACT_ERRORS.getError(error.response?.data.code_error));
  }, [error]);

  const onView = (row: IContractListItem) => {
    setSelectedContract(row.id);
    setIsViewContractSidePanelOpen(true);
  };

  const onDownloadContract = () => {
    alert('not yet implemented');
  };

  const onSignContract = (row: IContractListItem) => {
    approveContract(row.id, {
      onSuccess: () => {
        useSuccessToast(i18n.t('documents:contracts.form.submit.messages.confirm'));
        refetch();
      },
      onError: (error) => {
        useErrorToast(InternalErrors.CONTRACT_ERRORS.getError(error.response?.data.code_error));
      },
    });
  };

  const onRejectContract = (row: IContractListItem) => {
    setShowRejectContract(row);
  };

  const onRemove = (row: IContractListItem) => {
    setShowDeleteContract(row);
  };

  const buildContractActionColumn = (): TableColumn<IContractListItem> => {
    const contractsMenuItems = [
      {
        label: i18n.t('events:popover.view'),
        icon: <EyeIcon className="menu-icon" />,
        onClick: onView,
      },
      {
        label: i18n.t('general:download', { item: i18n.t('general:contract').toLowerCase() }),
        icon: <ArrowDownTrayIcon className="menu-icon" />,
        onClick: onDownloadContract,
      },
    ];

    const contractsValidateOngMenuItems = [
      ...contractsMenuItems,
      {
        label: t('documents:contracts.side_panel.confirm'),
        icon: <CheckIcon className="menu-icon" />,
        onClick: onSignContract,
      },
      {
        label: i18n.t('documents:popover.reject'),
        icon: <XMarkIcon className="menu-icon" />,
        onClick: onRejectContract,
      },
      {
        label: i18n.t('documents:popover.remove'),
        icon: <TrashIcon className="menu-icon" />,
        alert: true,
        onClick: onRemove,
      },
    ];

    const contractsValidateVolunteerMenuItems = [
      ...contractsMenuItems,
      {
        label: i18n.t('documents:popover.remove'),
        icon: <TrashIcon className="menu-icon" />,
        alert: true,
        onClick: onRemove,
      },
    ];

    const contractsRejectedMenuItems = [
      {
        label: i18n.t('events:popover.view'),
        icon: <EyeIcon className="menu-icon" />,
        onClick: onView,
      },
      {
        label: i18n.t('documents:popover.remove_from_list'),
        icon: <TrashIcon className="menu-icon" />,
        alert: true,
        onClick: onRemove,
      },
    ];

    const mapContractStatusToPopoverItems = (status: ContractStatus) => {
      switch (status) {
        case ContractStatus.ACTIVE:
        case ContractStatus.CLOSED:
        case ContractStatus.NOT_STARTED:
          return contractsMenuItems;
        case ContractStatus.PENDING_ADMIN:
          return contractsValidateOngMenuItems;
        case ContractStatus.PENDING_VOLUNTEER:
          return contractsValidateVolunteerMenuItems;
        case ContractStatus.REJECTED:
          return contractsRejectedMenuItems;
        default:
          return [];
      }
    };

    return {
      name: '',
      cell: (row: IContractListItem) => (
        <Popover<IContractListItem> row={row} items={mapContractStatusToPopoverItems(row.status)} />
      ),
      width: '50px',
      allowOverflow: true,
    };
  };

  const buildContractTableHeader = (): TableColumn<IContractListItem>[] => {
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

  const onSort = (column: TableColumn<IContractListItem>, direction: SortOrder) => {
    setQuery({
      orderBy: column.id as string,
      orderDirection:
        direction.toLocaleUpperCase() === OrderDirection.ASC
          ? OrderDirection.ASC
          : OrderDirection.DESC,
    });
  };

  const onDownloadApproved = () => {
    alert('not yet implemented');
  };

  const onAddContract = () => {
    navigate('/documents/contracts/add');
  };

  const onStartDateChange = (startDate: Date | null) => {
    setQuery({ startDate: startDate as Date });
  };

  const onEndDateChange = (endDate: Date | null) => {
    setQuery({ endDate: endDate as Date });
  };

  const onVolunteerChange = (volunteer: ListItem) => {
    setQuery({ volunteer: volunteer.label });
  };

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

  const onStatusChange = (item: SelectItem<ContractStatus>) => {
    setQuery({ status: item.key });
  };

  const onCloseSidePanel = (shouldRefetch?: boolean) => {
    setIsViewContractSidePanelOpen(false);
    setSelectedContract(undefined);
    if (shouldRefetch) refetch();
  };

  const confirmReject = (rejectMessage?: string) => {
    if (showRejectContract)
      rejectContract(
        {
          id: showRejectContract.id,
          rejectMessage,
        },
        {
          onSuccess: () => {
            useSuccessToast(i18n.t('documents:contracts.form.submit.messages.reject'));
            refetch();
          },
          onError: (error) => {
            InternalErrors.CONTRACT_ERRORS.getError(error.response?.data.code_error);
          },
          onSettled: () => {
            setShowRejectContract(null);
          },
        },
      );
  };

  const confirmDelete = () => {
    if (showDeleteContract)
      deleteContract(showDeleteContract.id, {
        onSuccess: () => {
          useSuccessToast(i18n.t('documents:contracts.form.submit.messages.remove_contract'));
          refetch();
        },
        onError: (error) => {
          InternalErrors.CONTRACT_ERRORS.getError(error.response?.data.code_error);
        },
        onSettled: () => {
          setShowDeleteContract(null);
        },
      });
  };

  return (
    <>
      <DataTableFilters
        onSearch={onSearch}
        searchValue={query?.search}
        onResetFilters={onResetFilters}
      >
        {!volunteerName && (
          <VolunteerSelect
            label={t('volunteer:name', { status: '' })}
            defaultValue={query.volunteer ? { value: '', label: query.volunteer } : undefined}
            onSelect={onVolunteerChange}
          />
        )}
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
        <Select
          options={StatusOptions}
          onChange={onStatusChange}
          placeholder={`${t('general:select', { item: '' })}`}
          label={`${t('contracts.filters.status')}`}
          selected={StatusOptions.find((option) => option.key === query.status)}
        />
      </DataTableFilters>
      <Card>
        <CardHeader>
          <h2>{t('contracts.statistics.total', { total: contracts?.meta.totalItems })}</h2>
          <div className="flex gap-2 lg:gap-6">
            <Button
              label={t('contracts.actions.download')}
              className="btn-outline-secondary"
              icon={<ArrowDownTrayIcon className="h-5 w-5" />}
              onClick={onDownloadApproved}
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
          <DataTableComponent
            columns={[...buildContractTableHeader(), buildContractActionColumn()]}
            data={contracts?.items}
            loading={
              isContractsLoading || isDeletingContract || isRejectingContract || isApprovingContract
            }
            pagination
            paginationPerPage={query.limit}
            paginationTotalRows={contracts?.meta?.totalItems}
            paginationDefaultPage={query.page}
            onChangeRowsPerPage={onRowsPerPageChange}
            onChangePage={onChangePage}
            onSort={onSort}
          />
        </CardBody>
        {showRejectContract && (
          <RejectTextareaModal
            label={i18n.t('documents:contracts.reject_modal.description')}
            title={i18n.t('documents:contracts.reject_modal.title')}
            onClose={setShowRejectContract.bind(null, null)}
            onConfirm={confirmReject}
            secondaryBtnLabel={`${i18n.t('documents:contracts.reject_modal.send')}`}
            primaryBtnLabel={`${i18n.t('documents:contracts.side_panel.reject')}`}
            primaryBtnClassName="btn-danger"
          />
        )}
        {showDeleteContract && (
          <ConfirmationModal
            title={i18n.t('documents:contracts.confirmation_modal.title_contract')}
            description={i18n.t('documents:contracts.confirmation_modal.description_contract')}
            confirmBtnLabel={i18n.t('documents:contracts.confirmation_modal.label_contract')}
            onClose={setShowDeleteContract.bind(null, null)}
            onConfirm={confirmDelete}
            confirmBtnClassName="btn-danger"
          />
        )}
      </Card>
      <ContractSidePanel
        onClose={onCloseSidePanel}
        isOpen={isViewContractSidePanelOpen}
        contractId={selectedContract}
      />
    </>
  );
};

export default ContractsTable;
