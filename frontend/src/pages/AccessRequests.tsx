import React, { useEffect, useState } from 'react';
import {
  ArrowDownTrayIcon,
  CheckIcon,
  EyeIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { AxiosError } from 'axios';
import { SortOrder, TableColumn } from 'react-data-table-component';
import { UseQueryResult } from 'react-query';
import i18n from '../common/config/i18n';
import { OrderDirection } from '../common/enums/order-direction.enum';
import { RequestStatus } from '../common/enums/request-status.enum';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { IAccessRequest } from '../common/interfaces/access-request.interface';
import { IBusinessException } from '../common/interfaces/business-exception.interface';
import { IPaginatedEntity } from '../common/interfaces/paginated-entity.interface';
import { formatDate } from '../common/utils/utils';
import Button from '../components/Button';
import CardBody from '../components/CardBody';
import CardHeader from '../components/CardHeader';
import DataTableComponent from '../components/DataTableComponent';
import MediaCell from '../components/MediaCell';
import PageHeader from '../components/PageHeader';
import Popover from '../components/Popover';
import { SelectItem } from '../components/Select';
import Tabs from '../components/Tabs';
import { useErrorToast, useSuccessToast } from '../hooks/useToast';
import Card from '../layouts/CardLayout';
import PageLayout from '../layouts/PageLayout';
import {
  useApproveAccessRequestMutation,
  useDeleteAccessRequestMutation,
  useNewAccessRequestsQuery,
  useRejectAccessRequestMutation,
  useRejectedAccessRequestsQuery,
} from '../services/access-requests/access-requests.service';
import RejectTextareaModal from '../components/RejectTextareaModal';
import ConfirmationModal from '../components/ConfirmationModal';
import { useNavigate } from 'react-router-dom';
import { ACCESS_REQUEST_ERRORS } from '../common/errors/entities/access-request.errors';
import DataTableFilters from '../components/DataTableFilters';
import DateRangePicker from '../components/DateRangePicker';
import LocationSelect from '../containers/LocationSelect';
import { ListItem } from '../common/interfaces/list-item.interface';

const AccessRequestsTabs: SelectItem<RequestStatus>[] = [
  { key: RequestStatus.PENDING, value: i18n.t('access_requests:tabs.requests') },
  { key: RequestStatus.REJECTED, value: i18n.t('access_requests:tabs.rejected_requests') },
];

const PendingAccessRequestsTableHeader = [
  {
    id: 'requestedBy.name',
    name: i18n.t('general:name'),
    sortable: true,
    cell: (row: IAccessRequest) => (
      <MediaCell logo={row.requestedBy.profilePicture || ''} title={row.requestedBy.name} />
    ),
  },
  {
    id: 'requestedBy.email',
    name: i18n.t('general:contact'),
    sortable: true,
    selector: (row: IAccessRequest) => `${row.requestedBy.email}\n${row.requestedBy.phone}`,
  },
  {
    id: 'requestedBy.location.name',
    name: i18n.t('general:location'),
    sortable: true,
    selector: (row: IAccessRequest) =>
      row.requestedBy.location
        ? `${row.requestedBy.location?.name}, ${row.requestedBy.location?.county?.abbreviation}`
        : '',
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

interface AccessRequestTable {
  useAccessRequests: (
    rowsPerPage: number,
    page: number,
    orderByColumn?: string,
    orderDirection?: OrderDirection,
    search?: string,
    start?: Date,
    end?: Date,
    location?: string,
  ) => UseQueryResult<
    IPaginatedEntity<IAccessRequest>,
    AxiosError<IBusinessException<ACCESS_REQUEST_ERRORS>>
  >;
  status: RequestStatus;
}

const AccessRequestTable = ({ useAccessRequests, status }: AccessRequestTable) => {
  const navigate = useNavigate();
  // pagination state
  const [page, setPage] = useState<number>();
  const [rowsPerPage, setRowsPerPage] = useState<number>();
  const [orderByColumn, setOrderByColumn] = useState<string>();
  const [orderDirection, setOrderDirection] = useState<OrderDirection>(OrderDirection.ASC);
  // filters
  const [searchWord, setSearchWord] = useState<string>();
  const [createdOnRange, setCreatedOnRange] = useState<Date[]>([]);
  const [location, setLocation] = useState<ListItem>();
  // confirmation modals
  const [showRejectAccessRequest, setShowRejectAccessRequest] = useState<null | IAccessRequest>(
    null,
  );
  const [showDeleteAccessRequest, setShowDeleteAccessRequest] = useState<null | IAccessRequest>(
    null,
  );

  // access requests query
  const {
    data: accessRequests,
    isLoading: isAccessRequestsLoading,
    error: accessCodeRequestError,
    refetch,
  } = useAccessRequests(
    rowsPerPage as number,
    page as number,
    orderByColumn,
    orderDirection,
    searchWord,
    createdOnRange[0],
    createdOnRange[1],
    location?.value,
  );

  // actions
  const { mutateAsync: approveAccessRequest, isLoading: isApprovingRequest } =
    useApproveAccessRequestMutation();

  const { mutateAsync: rejectAccessRequest, isLoading: isRejectingAccessRequest } =
    useRejectAccessRequestMutation();

  const { mutateAsync: deleteAccessRequest, isLoading: isDeletingAccessRequest } =
    useDeleteAccessRequestMutation();

  useEffect(() => {
    if (accessCodeRequestError)
      useErrorToast(
        InternalErrors.ACCESS_REQUEST_ERRORS.getError(
          accessCodeRequestError.response?.data.code_error,
        ),
      );
  }, [accessCodeRequestError]);

  // menu items
  const buildPendingAccessRequestsActionColumn = (): TableColumn<IAccessRequest> => {
    const pendingAccessRequestsMenuItems = [
      {
        label: i18n.t('access_requests:popover.view'),
        icon: <EyeIcon className="menu-icon" />,
        onClick: onView,
      },
      {
        label: i18n.t('access_requests:popover.approve'),
        icon: <CheckIcon className="menu-icon" />,
        onClick: onApprove,
      },
      {
        label: i18n.t('access_requests:popover.reject'),
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
        label: i18n.t('access_requests:popover.view'),
        icon: <EyeIcon className="menu-icon" />,
        onClick: onView,
      },
      {
        label: i18n.t('access_requests:popover.delete'),
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

  const buildAccessRequestActionColumns = () =>
    status === RequestStatus.REJECTED
      ? buildRejectedAccessRequestsActionColumn()
      : buildPendingAccessRequestsActionColumn();

  const onSort = (column: TableColumn<IAccessRequest>, direction: SortOrder) => {
    setOrderByColumn(column.id as string);
    setOrderDirection(
      direction.toLocaleUpperCase() === OrderDirection.ASC
        ? OrderDirection.ASC
        : OrderDirection.DESC,
    );
  };

  // row actions
  const onView = (row: IAccessRequest) => {
    navigate(row.id);
  };

  const onReject = (row: IAccessRequest) => {
    setShowRejectAccessRequest(row);
  };

  const onDelete = (row: IAccessRequest) => {
    setShowDeleteAccessRequest(row);
  };

  const onApprove = (row: IAccessRequest) => {
    approveAccessRequest(row.id, {
      onSuccess: () => {
        useSuccessToast(
          i18n.t('volunteer:registration.confirmation_message', {
            option: i18n.t('volunteer:registration.confirmation_options.approved'),
          }),
        );
        refetch();
      },
      onError: (error) => {
        InternalErrors.ACCESS_REQUEST_ERRORS.getError(error.response?.data.code_error);
      },
    });
  };

  const confirmReject = (rejectMessage?: string) => {
    if (showRejectAccessRequest)
      rejectAccessRequest(
        {
          id: showRejectAccessRequest.id,
          rejectMessage,
        },
        {
          onSuccess: () => {
            useSuccessToast(
              i18n.t('volunteer:registration.confirmation_message', {
                option: i18n.t('volunteer:registration.confirmation_options.rejected'),
              }),
            );
            refetch();
          },
          onError: (error) => {
            InternalErrors.ACCESS_REQUEST_ERRORS.getError(error.response?.data.code_error);
          },
          onSettled: () => {
            setShowRejectAccessRequest(null);
          },
        },
      );
  };

  const confirmDelete = () => {
    if (showDeleteAccessRequest)
      deleteAccessRequest(showDeleteAccessRequest.id, {
        onSuccess: () => {
          useSuccessToast(
            i18n.t('volunteer:registration.confirmation_message', {
              option: i18n.t('volunteer:registration.confirmation_options.deleted'),
            }),
          );
          refetch();
        },
        onError: (error) => {
          InternalErrors.ACCESS_REQUEST_ERRORS.getError(error.response?.data.code_error);
        },
        onSettled: () => {
          setShowDeleteAccessRequest(null);
        },
      });
  };

  const onResetFilters = () => {
    setCreatedOnRange([]);
    setLocation(undefined);
  };

  return (
    <>
      <DataTableFilters onSearch={setSearchWord} onResetFilters={onResetFilters}>
        <DateRangePicker
          label={i18n.t('access_requests:filters.access_request_range')}
          onChange={setCreatedOnRange}
          value={createdOnRange.length > 0 ? createdOnRange : undefined}
          id="created-on-range__picker"
        />
        <LocationSelect
          label={i18n.t('general:location')}
          onSelect={setLocation}
          defaultValue={location}
        />
      </DataTableFilters>
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
          <DataTableComponent
            columns={[
              ...(status === RequestStatus.REJECTED
                ? RejectedAccessRequestsTableHeader
                : PendingAccessRequestsTableHeader),
              buildAccessRequestActionColumns(),
            ]}
            data={accessRequests?.items}
            loading={
              isAccessRequestsLoading ||
              isApprovingRequest ||
              isRejectingAccessRequest ||
              isDeletingAccessRequest
            }
            pagination
            paginationPerPage={rowsPerPage}
            paginationTotalRows={accessRequests?.meta?.totalItems}
            paginationDefaultPage={page}
            onChangeRowsPerPage={setRowsPerPage}
            onChangePage={setPage}
            onSort={onSort}
          />
        </CardBody>
        {showRejectAccessRequest && (
          <RejectTextareaModal
            label={i18n.t('reject_modal:description')}
            title={i18n.t('reject_modal:title')}
            onClose={setShowRejectAccessRequest.bind(null, null)}
            onConfirm={confirmReject}
          />
        )}
        {showDeleteAccessRequest && (
          <ConfirmationModal
            title={i18n.t('access_requests:confirmation_modal.title')}
            description={i18n.t('access_requests:confirmation_modal.description')}
            confirmBtnLabel={i18n.t('access_requests:confirmation_modal.button_label')}
            onClose={setShowDeleteAccessRequest.bind(null, null)}
            onConfirm={confirmDelete}
            confirmBtnClassName="btn-danger"
          />
        )}
      </Card>
    </>
  );
};

const AccessRequests = () => {
  const [requestStatus, setRequestStatus] = useState<RequestStatus>(RequestStatus.PENDING);

  const onTabClick = (tab: RequestStatus) => {
    setRequestStatus(tab);
  };

  return (
    <PageLayout>
      <PageHeader>{i18n.t('side_menu:options.access_requests')}</PageHeader>
      <Tabs<RequestStatus> tabs={AccessRequestsTabs} onClick={onTabClick}>
        {requestStatus === RequestStatus.PENDING && (
          <>
            <AccessRequestTable
              useAccessRequests={useNewAccessRequestsQuery}
              status={requestStatus}
            />
          </>
        )}
        {requestStatus === RequestStatus.REJECTED && (
          <AccessRequestTable
            useAccessRequests={useRejectedAccessRequestsQuery}
            status={requestStatus}
          />
        )}
      </Tabs>
    </PageLayout>
  );
};

export default AccessRequests;
