import React, { useEffect } from 'react';
import DataTableComponent from './DataTableComponent';
import CardHeader from './CardHeader';
import CardBody from './CardBody';
import Card from '../layouts/CardLayout';
import { IContractListItem } from '../common/interfaces/contract.interface';
import i18n from '../common/config/i18n';
import { ArrowDownTrayIcon, EyeIcon, PlusIcon } from '@heroicons/react/24/outline';
import { SortOrder, TableColumn } from 'react-data-table-component';
import { useContractsQuery } from '../services/contracts/contracts.service';
import { OrderDirection } from '../common/enums/order-direction.enum';
import { ContractsTableProps } from '../containers/query/ContractsTableWithQueryParams';
import Popover from './Popover';
import { useErrorToast } from '../hooks/useToast';
import { InternalErrors } from '../common/errors/internal-errors.class';
import Button from './Button';
import { ContractStatusMarkerColorMapper, formatDate } from '../common/utils/utils';
import LinkCell from './LinkCell';
import CellLayout from '../layouts/CellLayout';
import StatusWithMarker from './StatusWithMarker';

const ContractsTableHeader = [
  {
    id: 'number',
    name: i18n.t('documents:contracts.number'),
    sortable: true,
    selector: (row: IContractListItem) => row.number,
  },
  {
    id: 'volunteer',
    name: i18n.t('volunteer:name', { status: '' }),
    grow: 2,
    sortable: true,
    cell: (row: IContractListItem) => (
      <LinkCell href={`/volunteers/${row.volunteer.id}`}>{row.volunteer.name}</LinkCell>
    ),
  },
  {
    id: 'status',
    name: i18n.t('general:status'),
    minWidth: '11rem',
    sortable: true,
    cell: (row: IContractListItem) => (
      <CellLayout>
        <StatusWithMarker markerColor={ContractStatusMarkerColorMapper[row.status]}>
          {i18n.t(`documents:contracts.display_status.${row.status}`)}
        </StatusWithMarker>
      </CellLayout>
    ),
  },
  {
    id: 'startDate',
    name: i18n.t('events:form.start_date.label'),
    sortable: true,
    selector: (row: IContractListItem) => formatDate(row.startDate),
  },
  {
    id: 'endDate',
    name: i18n.t('events:form.end_date.label'),
    sortable: true,
    selector: (row: IContractListItem) => formatDate(row.endDate),
  },
];

const ContractsTable = ({ query, setQuery }: ContractsTableProps) => {
  const {
    data: contracts,
    isLoading,
    error,
  } = useContractsQuery({
    limit: query?.limit as number,
    page: query?.page as number,
    orderBy: query?.orderBy as string,
    orderDirection: query?.orderDirection as OrderDirection,
  });

  // query error handling
  useEffect(() => {
    if (error)
      useErrorToast(InternalErrors.CONTRACT_ERRORS.getError(error.response?.data.code_error));
  }, [error]);

  const onView = () => {
    alert('not yet implemented');
  };

  const onDownloadContract = () => {
    alert('not yet implemented');
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

    return {
      name: '',
      cell: (row: IContractListItem) => (
        <Popover<IContractListItem> row={row} items={contractsMenuItems} />
      ),
      width: '50px',
      allowOverflow: true,
    };
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
    alert('not yet implemented');
  };

  return (
    <>
      <Card>
        <CardHeader>
          <h2>{i18n.t('documents:contracts.total', { value: 235 })}</h2>
          <div className="flex gap-2 lg:gap-6">
            <Button
              label={i18n.t('documents:contracts.download')}
              className="btn-outline-secondary"
              icon={<ArrowDownTrayIcon className="h-5 w-5" />}
              onClick={onDownloadApproved}
            />
            <Button
              label={i18n.t('documents:contracts.generate')}
              className="btn-primary"
              icon={<PlusIcon className="h-5 w-5" />}
              onClick={onAddContract}
            />
          </div>
        </CardHeader>
        <CardBody>
          <DataTableComponent
            columns={[...ContractsTableHeader, buildContractActionColumn()]}
            data={contracts?.items}
            loading={isLoading}
            pagination
            paginationPerPage={query.limit}
            paginationTotalRows={contracts?.meta?.totalItems}
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

export default ContractsTable;
