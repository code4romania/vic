import React, { useEffect, useState } from 'react';
import PageLayout from '../layouts/PageLayout';
import Card from '../layouts/CardLayout';
import CardHeader from '../components/CardHeader';
import CardBody from '../components/CardBody';
import Button from '../components/Button';
import Tabs from '../components/Tabs';
import DataTableComponent from '../components/DataTableComponent';
import i18n from '../common/config/i18n';
import {
  ArrowDownTrayIcon,
  CheckIcon,
  EyeIcon,
  XMarkIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useAccessRequestsQuery } from '../services/access-requests/access-requests.service';
import { SortOrder, TableColumn } from 'react-data-table-component';
import Popover from '../components/Popover';
import { OrderDirection } from '../common/enums/order-direction.enum';
import { SelectItem } from '../components/Select';
import { PaginationConfig } from '../common/constants/pagination';
import { formatDate } from '../common/utils/utils';
import { useErrorToast } from '../hooks/useToast';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { RequestStatus } from '../common/enums/request-status.enum';
import MediaCell from '../components/MediaCell';

export interface IAccessRequest {
  id: string;
  logo: string;
  name: string;
  address: string;
  email: string;
  phone: string;
  createdOn: Date;
  updatedOn?: Date;
}

const AccessRequestsTabs: SelectItem<RequestStatus>[] = [
  { key: RequestStatus.PENDING, value: i18n.t('access_requests:tabs.requests') },
  { key: RequestStatus.REJECTED, value: i18n.t('access_requests:tabs.rejected_requests') },
];

const PendingAccessRequestsTableHeader = [
  {
    id: 'name',
    name: i18n.t('general:name'),
    sortable: true,
    cell: (row: IAccessRequest) => <MediaCell logo={row.logo} name={row.name} />,
  },
  {
    id: 'contact',
    name: i18n.t('access_requests:contact'),
    sortable: true,
    selector: (row: IAccessRequest) => `${row.email}\n${row.phone}`,
  },
  {
    id: 'location',
    name: i18n.t('general:location'),
    sortable: true,
    selector: (row: IAccessRequest) => row.address,
  },
  {
    id: 'createdOn',
    name: i18n.t('access_requests:date'),
    sortable: true,
    selector: (row: IAccessRequest) => formatDate(row.createdOn),
  },
];

const RejectedAccessRequestsTableHeader = [
  ...PendingAccessRequestsTableHeader,
  {
    id: 'rejectedDate',
    name: i18n.t('access_requests:rejected_date'),
    sortable: true,
    selector: (row: IAccessRequest) => formatDate(row.updatedOn || new Date()),
  },
];

const AccessRequests = () => {
  const [requestStatus, setRequestStatus] = useState<RequestStatus>(RequestStatus.PENDING);
  const [page, setPage] = useState<number>();
  const [rowsPerPage, setRowsPerPage] = useState<number>();
  const [orderByColumn, setOrderByColumn] = useState<string>();
  const [orderDirection, setOrderDirection] = useState<OrderDirection>();

  const {
    data: accessRequests,
    isLoading: isAccessRequestsLoading,
    error: accessCodeRequestError,
  } = useAccessRequestsQuery(
    requestStatus,
    rowsPerPage as number,
    page as number,
    orderByColumn,
    orderDirection,
  );

  useEffect(() => {
    if (accessRequests?.meta) {
      setPage(accessRequests.meta.currentPage);
      setRowsPerPage(accessRequests.meta.itemsPerPage);
      setOrderByColumn(accessRequests.meta.orderByColumn);
      setOrderDirection(accessRequests.meta.orderDirection);
    }
  }, []);

  useEffect(() => {
    if (accessCodeRequestError)
      useErrorToast(
        InternalErrors.ACCESS_CODE_ERRORS.getError(
          accessCodeRequestError.response?.data.code_error,
        ),
      );
  }, [accessCodeRequestError]);

  const onTabClick = (tab: RequestStatus) => {
    setRequestStatus(tab);
  };

  // row actions
  const onView = (row: IAccessRequest) => {
    alert(`Not yet implemented, ${row}`);
  };

  const onApprove = (row: IAccessRequest) => {
    console.log(`Not yet implemented, ${row}`);
  };

  const onReject = (row: IAccessRequest) => {
    alert(`Not yet implemented, ${row}`);
  };

  const onDelete = (row: IAccessRequest) => {
    alert(`Not yet implemented, ${row}`);
  };

  // menu items
  const buildPendingAccessRequestsActionColumn = (): TableColumn<IAccessRequest> => {
    const pendingAccessRequestsMenuItems = [
      {
        label: i18n.t('access_requests:modal.view'),
        icon: <EyeIcon className="menu-icon" />,
        onClick: onView,
      },
      {
        label: i18n.t('access_requests:modal.approve'),
        icon: <CheckIcon className="menu-icon" />,
        onClick: onApprove,
      },
      {
        label: i18n.t('access_requests:modal.reject'),
        icon: <XMarkIcon className="menu-icon" />,
        onClick: onReject,
        alert: true,
      },
    ];

    return {
      name: '',
      cell: (row: IAccessRequest) => (
        <Popover<IAccessRequest> row={row} items={pendingAccessRequestsMenuItems} />
      ),
      width: '50px',
      allowOverflow: true,
    };
  };

  const buildRejectedAccessRequestsActionColumn = (): TableColumn<IAccessRequest> => {
    const rejectedAccessRequestsMenuItems = [
      {
        label: i18n.t('access_requests:modal.view'),
        icon: <EyeIcon className="menu-icon" />,
        onClick: onView,
      },
      {
        label: i18n.t('access_requests:modal.delete'),
        icon: <TrashIcon className="menu-icon" />,
        onClick: onDelete,
        alert: true,
      },
    ];

    return {
      name: '',
      cell: (row: IAccessRequest) => (
        <Popover<IAccessRequest> row={row} items={rejectedAccessRequestsMenuItems} />
      ),
      width: '50px',
      allowOverflow: true,
    };
  };

  const onSort = (column: TableColumn<IAccessRequest>, direction: SortOrder) => {
    setOrderByColumn(column.id as string);
    setOrderDirection(
      direction.toLocaleUpperCase() === OrderDirection.ASC
        ? OrderDirection.ASC
        : OrderDirection.DESC,
    );
  };

  return (
    <PageLayout>
      <h1>{i18n.t('side_menu:options.volunteers.access_requests')}</h1>
      <Tabs<RequestStatus> tabs={AccessRequestsTabs} onClick={onTabClick}>
        <Card>
          <CardHeader>
            <Button
              label={i18n.t('general:download_table')}
              icon={<ArrowDownTrayIcon className="h-5 w-5 text-cool-gray-600" />}
              className="btn-outline-secondary ml-auto"
              onClick={() => alert('Not implemented')}
            />
          </CardHeader>
          <CardBody>
            {requestStatus === RequestStatus.PENDING && (
              <DataTableComponent
                columns={[
                  ...PendingAccessRequestsTableHeader,
                  buildPendingAccessRequestsActionColumn(),
                ]}
                data={accessRequests?.items}
                loading={isAccessRequestsLoading}
                pagination
                paginationPerPage={rowsPerPage}
                paginationRowsPerPageOptions={PaginationConfig.rowsPerPageOptions}
                paginationTotalRows={accessRequests?.meta?.totalItems}
                paginationDefaultPage={page}
                onChangeRowsPerPage={setRowsPerPage}
                onChangePage={setPage}
                onSort={onSort}
              />
            )}
            {requestStatus === RequestStatus.REJECTED && (
              <DataTableComponent
                columns={[
                  ...RejectedAccessRequestsTableHeader,
                  buildRejectedAccessRequestsActionColumn(),
                ]}
                data={accessRequests?.items}
                loading={isAccessRequestsLoading}
                pagination
                paginationPerPage={rowsPerPage}
                paginationRowsPerPageOptions={PaginationConfig.rowsPerPageOptions}
                paginationTotalRows={accessRequests?.meta?.totalItems}
                paginationDefaultPage={page}
                onChangeRowsPerPage={setRowsPerPage}
                onChangePage={setPage}
                onSort={onSort}
              />
            )}
          </CardBody>
        </Card>
      </Tabs>
    </PageLayout>
  );
};

export default AccessRequests;
