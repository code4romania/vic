import React, { useEffect, useState } from 'react';
import {
  ArrowDownTrayIcon,
  CheckIcon,
  EyeIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { AxiosError } from 'axios';
import { Media, SortOrder, TableColumn } from 'react-data-table-component';
import { UseQueryResult } from 'react-query';
import { OrderDirection } from '../common/enums/order-direction.enum';
import { InternalErrors } from '../common/errors/internal-errors.class';
import Button from '../components/Button';
import CardBody from '../components/CardBody';
import CardHeader from '../components/CardHeader';
import DataTableComponent from '../components/DataTableComponent';
import { IBusinessException } from '../common/interfaces/business-exception.interface';
import { IPaginatedEntity } from '../common/interfaces/paginated-entity.interface';
import Popover from '../components/Popover';
import RejectTextareaModal from '../components/RejectTextareaModal';
import ConfirmationModal from '../components/ConfirmationModal';
import { useNavigate } from 'react-router-dom';
import { ACCESS_REQUEST_ERRORS } from '../common/errors/entities/access-request.errors';
import DataTableFilters from '../components/DataTableFilters';
import DateRangePicker from '../components/DateRangePicker';
import LocationSelect from '../containers/LocationSelect';
import { ListItem } from '../common/interfaces/list-item.interface';
import { downloadAccessRequests } from '../services/access-requests/access-requests.api';
import { useErrorToast, useSuccessToast } from '../hooks/useToast';
import { useValidationGate } from '../hooks/useValidationGate';
import Card from '../layouts/CardLayout';
import {
  useApproveAccessRequestMutation,
  useDeleteAccessRequestMutation,
  useRejectAccessRequestMutation,
} from '../services/access-requests/access-requests.service';
import i18n from '../common/config/i18n';
import { RequestStatus } from '../common/enums/request-status.enum';
import { downloadExcel } from '../common/utils/utils';
import { IAccessRequest } from '../common/interfaces/access-request.interface';
import { formatDate, formatLocation } from '../common/utils/utils';
import MediaCell from '../components/MediaCell';
import CellLayout from '../layouts/CellLayout';
import { AccessRequestsTableProps } from '../containers/query/AccessRequestTableWithQueryParams';

interface AccessRequestTableProps extends AccessRequestsTableProps {
  useAccessRequests: (
    rowsPerPage: number,
    page: number,
    orderByColumn?: string,
    orderDirection?: OrderDirection,
    search?: string,
    createdOnStart?: Date,
    createdOnEnd?: Date,
    city?: string,
    county?: string,
    rejectedOnStart?: Date,
    rejectedOnEnd?: Date,
  ) => UseQueryResult<
    IPaginatedEntity<IAccessRequest>,
    AxiosError<IBusinessException<ACCESS_REQUEST_ERRORS>>
  >;
  status: RequestStatus;
}

const PendingAccessRequestsTableHeader = [
  {
    id: 'requestedBy.name',
    name: i18n.t('general:name'),
    sortable: true,
    grow: 2,
    cell: (row: IAccessRequest) => (
      <MediaCell logo={row.requestedBy.profilePicture || ''} title={row.requestedBy.name} />
    ),
  },
  {
    id: 'requestedBy.email',
    hide: Media.SM,
    name: i18n.t('general:contact'),
    sortable: true,
    minWidth: '12rem',
    selector: (row: IAccessRequest) =>
      [row.requestedBy.email, row.requestedBy.phone].filter(Boolean).join('\n'),
  },
  {
    id: 'location.name',
    hide: Media.SM,
    name: i18n.t('general:location'),
    sortable: true,
    selector: (row: IAccessRequest) => formatLocation(row.requestedBy.location),
  },
  {
    id: 'createdOn',
    hide: Media.SM,
    name: i18n.t('access_requests:date'),
    sortable: true,
    cell: (row: IAccessRequest) => <CellLayout>{formatDate(row.createdOn)}</CellLayout>,
  },
];

const RejectedAccessRequestsTableHeader = [
  ...PendingAccessRequestsTableHeader,
  {
    id: 'updatedOn',
    hide: Media.SM,
    name: i18n.t('access_requests:rejected_date'),
    sortable: true,
    cell: (row: IAccessRequest) => <CellLayout>{formatDate(row.updatedOn)}</CellLayout>,
  },
];

// #500: the decision can be changed, so the date the request was decided on is shown on both tabs
const ApprovedAccessRequestsTableHeader = [
  ...PendingAccessRequestsTableHeader,
  {
    id: 'updatedOn',
    hide: Media.SM,
    name: i18n.t('access_requests:approved_date'),
    sortable: true,
    cell: (row: IAccessRequest) => <CellLayout>{formatDate(row.updatedOn)}</CellLayout>,
  },
];

const AccessRequestTable = ({
  useAccessRequests,
  status,
  query,
  setQuery,
}: AccessRequestTableProps) => {
  const navigate = useNavigate();
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
    query.limit as number,
    query.page as number,
    query.orderBy,
    query.orderDirection as OrderDirection,
    query.search,
    query.createdOnStart,
    query.createdOnEnd,
    query?.location && query?.location[0],
    query?.location && query?.location[1],
    query?.rejectedOnStart,
    query?.rejectedOnEnd,
  );

  // approving brings a member in: only for a validated organization (decision 1)
  const { gate } = useValidationGate();

  // actions
  const { mutate: approveAccessRequest, isLoading: isApprovingRequest } =
    useApproveAccessRequestMutation();

  const { mutate: rejectAccessRequest, isLoading: isRejectingAccessRequest } =
    useRejectAccessRequestMutation();

  const { mutate: deleteAccessRequest, isLoading: isDeletingAccessRequest } =
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
        ...gate,
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
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="btn-outline-secondary py-1.5"
            aria-label={`${i18n.t('approvals:review')} ${row.requestedBy.name}`}
            onClick={() => onView(row)}
          >
            <EyeIcon className="w-4 h-4" aria-hidden="true" />
            {i18n.t('approvals:review')}
          </button>
          <Popover<IAccessRequest> row={row} items={pendingAccessRequestsMenuItems} />
        </div>
      ),
      minWidth: '11rem',
      right: true,
      allowOverflow: true,
    };
  };

  const buildApprovedAccessRequestsActionColumn = (): TableColumn<IAccessRequest> => {
    const approvedAccessRequestsMenuItems = [
      {
        label: i18n.t('access_requests:popover.view'),
        icon: <EyeIcon className="menu-icon" />,
        onClick: onView,
      },
      {
        label: i18n.t('access_requests:popover.change_to_rejected'),
        icon: <XMarkIcon className="menu-icon" />,
        onClick: onReject,
        alert: true,
      },
    ];

    return {
      name: '',
      cell: (row: IAccessRequest) => (
        <Popover<IAccessRequest> row={row} items={approvedAccessRequestsMenuItems} />
      ),
      width: '64px',
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
        label: i18n.t('access_requests:popover.change_to_approved'),
        icon: <CheckIcon className="menu-icon" />,
        onClick: onApprove,
        ...gate,
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
      width: '64px',
      allowOverflow: true,
    };
  };

  const buildAccessRequestActionColumns = () => {
    if (status === RequestStatus.REJECTED) return buildRejectedAccessRequestsActionColumn();
    if (status === RequestStatus.APPROVED) return buildApprovedAccessRequestsActionColumn();
    return buildPendingAccessRequestsActionColumn();
  };

  const onActionError = (code?: ACCESS_REQUEST_ERRORS) => {
    useErrorToast(InternalErrors.ACCESS_REQUEST_ERRORS.getError(code));
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

  const onSort = (column: TableColumn<IAccessRequest>, direction: SortOrder) => {
    setQuery(
      {
        orderBy: column.id as string,
        orderDirection:
          direction.toLocaleUpperCase() === OrderDirection.ASC
            ? OrderDirection.ASC
            : OrderDirection.DESC,
        page: 1,
      },
      'replaceIn',
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
      onError: (error) => onActionError(error.response?.data.code_error),
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
          onError: (error) => onActionError(error.response?.data.code_error),
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
        onError: (error) => onActionError(error.response?.data.code_error),
        onSettled: () => {
          setShowDeleteAccessRequest(null);
        },
      });
  };

  const onResetFilters = () => {
    setLocation(undefined);
    setQuery({ requestStatus: query.requestStatus }, 'replace');
  };

  const onLocationChange = (location: ListItem) => {
    setLocation(location);
    setQuery(
      {
        location: location.label.split(', '),
        page: 1,
      },
      'replaceIn',
    );
  };

  const onSearch = (search: string) => {
    setQuery(
      {
        search,
        page: 1,
      },
      'replaceIn',
    );
  };

  const onCreatedOnRangeChange = ([createdOnStart, createdOnEnd]: Date[]) => {
    setQuery(
      {
        createdOnStart,
        createdOnEnd,
        page: 1,
      },
      'replaceIn',
    );
  };

  const onRejectedOnRangeChange = ([rejectedOnStart, rejectedOnEnd]: Date[]) => {
    setQuery(
      {
        rejectedOnStart,
        rejectedOnEnd,
        page: 1,
      },
      'replaceIn',
    );
  };

  const onExport = async () => {
    const { data: accessRequestsData } = await downloadAccessRequests(
      status,
      query.orderBy,
      query.orderDirection as OrderDirection,
      query.search,
      query.createdOnStart,
      query.createdOnEnd,
      query?.location && query?.location[0],
      query?.location && query?.location[1],
      query.rejectedOnStart,
      query.rejectedOnEnd,
    );

    downloadExcel(accessRequestsData, i18n.t('access_requests:download'));
  };

  return (
    <>
      <DataTableFilters
        onSearch={onSearch}
        searchValue={query?.search}
        onResetFilters={onResetFilters}
        results={
          <>
            {/* the count is in the table's title; only the export here */}
            <span />
            <Button
              label={i18n.t('general:download_table')}
              icon={<ArrowDownTrayIcon className="h-5 w-5 text-cool-gray-600" />}
              className="btn-text-primary px-2"
              onClick={onExport}
            />
          </>
        }
      >
        <DateRangePicker
          label={i18n.t('access_requests:filters.access_request_range')}
          onChange={onCreatedOnRangeChange}
          value={
            query?.createdOnStart && query?.createdOnEnd
              ? [query?.createdOnStart, query?.createdOnEnd]
              : undefined
          }
          id="created-on-range__picker"
        />
        {status === RequestStatus.REJECTED && (
          <DateRangePicker
            label={i18n.t('access_requests:filters.access_request_rejected_range')}
            onChange={onRejectedOnRangeChange}
            value={
              query?.rejectedOnStart && query?.rejectedOnEnd
                ? [query?.rejectedOnStart, query?.rejectedOnEnd]
                : undefined
            }
            id="rejected-on-range__picker"
          />
        )}
        <LocationSelect
          label={i18n.t('general:location')}
          onSelect={onLocationChange}
          value={location}
          defaultCity={query.location && query.location[0]}
          defaultCounty={query.location && query.location[1]}
        />
      </DataTableFilters>
      <Card>
        <CardHeader>
          <h2>
            {`${i18n.t(
              `access_requests:tabs.${
                status === RequestStatus.PENDING ? 'requests' : `${status}_requests`
              }`,
            )} (${accessRequests?.meta?.totalItems ?? 0})`}
          </h2>
        </CardHeader>
        <CardBody>
          <DataTableComponent
            columns={[
              ...(status === RequestStatus.REJECTED
                ? RejectedAccessRequestsTableHeader
                : status === RequestStatus.APPROVED
                  ? ApprovedAccessRequestsTableHeader
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
            error={accessCodeRequestError}
            onRetry={refetch}
            pagination
            paginationPerPage={query.limit}
            paginationTotalRows={accessRequests?.meta?.totalItems}
            paginationDefaultPage={query.page}
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
            requireReason
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

export default AccessRequestTable;
