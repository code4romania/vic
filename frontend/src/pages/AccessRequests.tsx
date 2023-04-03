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
import { downloadExcel, formatDate, formatLocation } from '../common/utils/utils';
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
import { downloadAccessRequests } from '../services/access-requests/access-requests.api';
import { DEFAULT_QUERY_PARAMS, PaginationConfig } from '../common/constants/pagination';
import { ArrayParam, DateParam, StringParam, useQueryParams } from 'use-query-params';
import CellLayout from '../layouts/CellLayout';

export const ACCESS_REQUESTS_QUERY_PARAMS = {
  ...DEFAULT_QUERY_PARAMS,
  status: StringParam,
  search: StringParam,
  createdOnStart: DateParam,
  createdOnEnd: DateParam,
  rejectedOnEnd: DateParam,
  rejectedOnStart: DateParam,
  location: ArrayParam,
};

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
    id: 'location.name',
    name: i18n.t('general:location'),
    sortable: true,
    selector: (row: IAccessRequest) => formatLocation(row.requestedBy.location),
  },
  {
    id: 'createdOn',
    name: i18n.t('access_requests:date'),
    sortable: true,
    cell: (row: IAccessRequest) => <CellLayout>{formatDate(row.createdOn)}</CellLayout>,
  },
];

const RejectedAccessRequestsTableHeader = [
  ...PendingAccessRequestsTableHeader,
  {
    id: 'updatedOn',
    name: i18n.t('access_requests:rejected_date'),
    sortable: true,
    cell: (row: IAccessRequest) => <CellLayout>{formatDate(row.updatedOn)}</CellLayout>,
  },
];

interface AccessRequestTable {
  useAccessRequests: (
    rowsPerPage: number,
    page: number,
    orderByColumn?: string,
    orderDirection?: OrderDirection,
    search?: string,
    createdOnStart?: Date,
    createdOnEnd?: Date,
    location?: string,
    rejectedOnStart?: Date,
    rejectedOnEnd?: Date,
  ) => UseQueryResult<
    IPaginatedEntity<IAccessRequest>,
    AxiosError<IBusinessException<ACCESS_REQUEST_ERRORS>>
  >;
}

const AccessRequestTable = ({ useAccessRequests }: AccessRequestTable) => {
  const navigate = useNavigate();
  // pagination state
  const [queryParams, setQueryParams] = useQueryParams(ACCESS_REQUESTS_QUERY_PARAMS);
  // filters
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
    queryParams?.limit as number,
    queryParams?.page as number,
    queryParams?.orderBy as string,
    queryParams?.orderDirection as OrderDirection,
    queryParams?.search as string,
    queryParams?.createdOnStart as Date,
    queryParams?.createdOnEnd as Date,
    location?.value,
    queryParams?.rejectedOnStart as Date,
    queryParams?.rejectedOnEnd as Date,
  );

  // actions
  const { mutateAsync: approveAccessRequest, isLoading: isApprovingRequest } =
    useApproveAccessRequestMutation();

  const { mutateAsync: rejectAccessRequest, isLoading: isRejectingAccessRequest } =
    useRejectAccessRequestMutation();

  const { mutateAsync: deleteAccessRequest, isLoading: isDeletingAccessRequest } =
    useDeleteAccessRequestMutation();

  // init query
  useEffect(() => {
    // init query params
    setQueryParams({
      limit: queryParams?.limit || PaginationConfig.defaultRowsPerPage,
      page: queryParams?.page || PaginationConfig.defaultPage,
      orderBy: queryParams?.orderBy || 'requestedBy.name',
      orderDirection: queryParams?.orderDirection || OrderDirection.ASC,
    });
  }, []);

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
    queryParams?.status === RequestStatus.REJECTED
      ? buildRejectedAccessRequestsActionColumn()
      : buildPendingAccessRequestsActionColumn();

  // pagination
  const onRowsPerPageChange = (rows: number) => {
    setQueryParams({
      ...queryParams,
      limit: rows,
    });
  };

  const onChangePage = (newPage: number) => {
    setQueryParams({
      ...queryParams,
      page: newPage,
    });
  };

  const onSort = (column: TableColumn<IAccessRequest>, direction: SortOrder) => {
    setQueryParams({
      orderBy: column.id as string,
      orderDirection:
        direction.toLocaleUpperCase() === OrderDirection.ASC
          ? OrderDirection.ASC
          : OrderDirection.DESC,
    });
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

  const onSearch = (search: string) => {
    setQueryParams({
      search: search || null,
    });
  };

  const onCreatedOnRangeChange = (range: Date[]) => {
    setQueryParams({
      createdOnStart: range[0] || null,
      createdOnEnd: range[1] || null,
    });
  };

  const onRejectedOnRangeChange = (range: Date[]) => {
    setQueryParams({
      rejectedOnStart: range[0] || null,
      rejectedOnEnd: range[1] || null,
    });
  };

  const onLocationChange = (location: ListItem) => {
    setLocation(location);
    setQueryParams({
      location: location.label.split(', '),
    });
  };

  const onResetFilters = () => {
    setLocation(undefined);
    setQueryParams({
      search: null,
      rejectedOnEnd: null,
      rejectedOnStart: null,
      createdOnEnd: null,
      createdOnStart: null,
      location: null,
    });
  };

  const onExport = async () => {
    const { data: accessRequestsData } = await downloadAccessRequests(
      queryParams?.status as RequestStatus,
      queryParams?.orderBy as string,
      queryParams?.orderDirection as OrderDirection,
      queryParams?.search as string,
      queryParams?.createdOnStart as Date,
      queryParams?.createdOnEnd as Date,
      location?.value,
      queryParams?.rejectedOnStart as Date,
      queryParams?.rejectedOnEnd as Date,
    );

    downloadExcel(accessRequestsData, i18n.t('access_requests:download'));
  };

  return (
    <>
      <DataTableFilters
        onSearch={onSearch}
        searchValue={queryParams?.search}
        onResetFilters={onResetFilters}
      >
        <DateRangePicker
          label={i18n.t('access_requests:filters.access_request_range')}
          onChange={onCreatedOnRangeChange}
          value={
            queryParams?.createdOnStart && queryParams?.createdOnEnd
              ? [queryParams?.createdOnStart, queryParams?.createdOnEnd]
              : undefined
          }
          id="created-on-range__picker"
        />
        {queryParams?.status === RequestStatus.REJECTED && (
          <DateRangePicker
            label={i18n.t('access_requests:filters.access_request_rejected_range')}
            onChange={onRejectedOnRangeChange}
            value={
              queryParams?.rejectedOnStart && queryParams?.rejectedOnEnd
                ? [queryParams?.rejectedOnStart, queryParams?.rejectedOnEnd]
                : undefined
            }
            id="rejected-on-range__picker"
          />
        )}
        <LocationSelect
          label={i18n.t('general:location')}
          onSelect={onLocationChange}
          defaultValue={location}
          queryValue={(queryParams?.location as string[]) || undefined}
        />
      </DataTableFilters>
      <Card>
        <CardHeader>
          <Button
            label={i18n.t('general:download_table')}
            icon={<ArrowDownTrayIcon className="h-5 w-5 text-cool-gray-600" />}
            className="btn-outline-secondary ml-auto"
            onClick={onExport}
          />
        </CardHeader>
        <CardBody>
          <DataTableComponent
            columns={[
              ...(queryParams?.status === RequestStatus.REJECTED
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
            paginationPerPage={accessRequests?.meta?.itemsPerPage}
            paginationTotalRows={accessRequests?.meta?.totalItems}
            paginationDefaultPage={queryParams.page as number}
            onChangeRowsPerPage={onRowsPerPageChange}
            onChangePage={onChangePage}
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
  const [requestStatus, setRequestStatus] = useState<RequestStatus>();

  // query params
  const [queryParams, setQueryParams] = useQueryParams(ACCESS_REQUESTS_QUERY_PARAMS);

  useEffect(() => {
    setRequestStatus((queryParams?.status as RequestStatus) || RequestStatus.PENDING);
  }, []);

  const onTabClick = (tab: RequestStatus) => {
    setQueryParams({ status: tab });
    setRequestStatus(tab);
  };

  return (
    <PageLayout>
      <PageHeader>{i18n.t('side_menu:options.access_requests')}</PageHeader>
      <Tabs<RequestStatus>
        tabs={AccessRequestsTabs}
        onClick={onTabClick}
        defaultTab={
          queryParams?.status
            ? AccessRequestsTabs.find((tab) => tab.key === queryParams?.status)
            : AccessRequestsTabs[0]
        }
      >
        {requestStatus === RequestStatus.PENDING && (
          <>
            <AccessRequestTable useAccessRequests={useNewAccessRequestsQuery} />
          </>
        )}
        {requestStatus === RequestStatus.REJECTED && (
          <AccessRequestTable useAccessRequests={useRejectedAccessRequestsQuery} />
        )}
      </Tabs>
    </PageLayout>
  );
};

export default AccessRequests;
