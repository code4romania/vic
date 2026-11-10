import { KeyIcon, PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { SortOrder, TableColumn } from 'react-data-table-component';
import { useNavigate } from 'react-router-dom';
import i18n from '../common/config/i18n';
import { OrderDirection } from '../common/enums/order-direction.enum';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { IUser } from '../common/interfaces/user.interface';
import { formatDate } from '../common/utils/utils';
import Button from '../components/Button';
import CardBody from '../components/CardBody';
import CardHeader from '../components/CardHeader';
import ConfirmationModal from '../components/ConfirmationModal';
import DataTableComponent from '../components/DataTableComponent';
import Popover from '../components/Popover';
import { useErrorToast, useSuccessToast } from '../hooks/useToast';
import { useValidationGate } from '../hooks/useValidationGate';
import Card from '../layouts/CardLayout';
import CellLayout from '../layouts/CellLayout';
import PageLayout from '../layouts/PageLayout';
import {
  useAccessCodesQuery,
  useDeleteAccessCodeMutation,
} from '../services/organization/organization.service';
import { AccessCodesProps } from '../containers/query/AccessCodesWithQueryParams';
import LinkCell from '../components/LinkCell';
import PageHeader from '../components/PageHeader';
import StatusBadge, { BadgeTone } from '../components/StatusBadge';
import InitialsAvatar from '../components/InitialsAvatar';
export interface IAccessCode {
  id: string;
  code: string;
  startDate: Date;
  endDate: Date;
  usageCount: number;
  createdOn: Date;
  createdBy: IUser;
}

type AccessCodeStatus = 'active' | 'scheduled' | 'expired';

const STATUS_TONE: Record<AccessCodeStatus, BadgeTone> = {
  active: 'green',
  scheduled: 'amber',
  expired: 'gray',
};

// Valid today, not started yet, or past its end date (an empty end date never expires).
export const accessCodeStatus = (code: IAccessCode, now = new Date()): AccessCodeStatus => {
  const day = (date: Date | string) => new Date(date).setHours(0, 0, 0, 0);
  const today = day(now);
  if (day(code.startDate) > today) return 'scheduled';
  if (code.endDate && day(code.endDate) < today) return 'expired';
  return 'active';
};

const AccessCodeTableHeader: TableColumn<IAccessCode>[] = [
  {
    id: 'code',
    name: i18n.t('access_code:name'),
    sortable: true,
    minWidth: '10rem',
    cell: (row: IAccessCode) => (
      <CellLayout>
        <span className="inline-flex items-center gap-2 rounded-md bg-cool-gray-50 border border-cool-gray-200 px-2 py-1 font-mono text-sm font-semibold text-cool-gray-900">
          <KeyIcon className="w-4 h-4 text-navy" aria-hidden="true" />
          {row.code}
        </span>
      </CellLayout>
    ),
  },
  {
    id: 'startDate',
    name: i18n.t('general:availability'),
    sortable: true,
    grow: 2,
    minWidth: '15rem',
    cell: (row: IAccessCode) => (
      <CellLayout>
        <div className="flex flex-col items-start gap-1">
          <span>{`${formatDate(row.startDate)} – ${
            row.endDate ? formatDate(row.endDate) : i18n.t('general:unlimited')
          }`}</span>
          <StatusBadge tone={STATUS_TONE[accessCodeStatus(row)]}>
            {i18n.t(`access_code:status.${accessCodeStatus(row)}`)}
          </StatusBadge>
        </div>
      </CellLayout>
    ),
  },
  {
    id: 'usageCount',
    name: i18n.t('general:uses'),
    sortable: true,
    minWidth: '6rem',
    cell: (row: IAccessCode) => (
      <CellLayout>
        <span className="font-robotoMedium text-cool-gray-900">
          {i18n.t('access_code:page.uses', { count: row.usageCount })}
        </span>
      </CellLayout>
    ),
  },
  {
    id: 'createdOn',
    name: i18n.t('general:created_on'),
    sortable: true,
    minWidth: '8rem',
    cell: (row: IAccessCode) => <CellLayout>{formatDate(row.createdOn)}</CellLayout>,
  },
  {
    id: 'createdBy.name',
    name: i18n.t('general:created_by'),
    sortable: true,
    minWidth: '12rem',
    cell: (row: IAccessCode) => (
      <div className="flex items-center gap-3 min-w-0">
        <InitialsAvatar name={row.createdBy.name} size="sm" />
        <LinkCell href={`/actions-archive?author=${row.createdBy.name}`}>
          {row.createdBy.name}
        </LinkCell>
      </div>
    ),
  },
];

const AccessCodes = ({ query, setQuery }: AccessCodesProps) => {
  const [showDeleteAccessCode, setShowDeleteAccessCode] = useState<null | IAccessCode>();
  const navigate = useNavigate();
  const { gate } = useValidationGate();

  const {
    data: accessCodes,
    error: accessCodesError,
    isLoading: isAccessCodesLoading,
    refetch,
  } = useAccessCodesQuery(
    query?.limit as number,
    query?.page as number,
    query?.orderBy as string,
    query?.orderDirection as OrderDirection,
  );

  const { mutateAsync: deleteAccessCode, isLoading: isDeleteAccessCodeLoading } =
    useDeleteAccessCodeMutation();

  useEffect(() => {
    if (accessCodesError) useErrorToast(i18n.t('general:error.load_entries'));
  }, [accessCodesError]);

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
    setQuery({ page }, 'replaceIn');
  };

  const onSort = (column: TableColumn<IAccessCode>, direction: SortOrder) => {
    setQuery(
      {
        orderBy: column.id as string,
        orderDirection:
          direction.toLocaleUpperCase() === OrderDirection.ASC
            ? OrderDirection.ASC
            : OrderDirection.DESC,
      },
      'replaceIn',
    );
  };

  // component actions
  const onAdd = () => {
    navigate('add');
  };

  // row actions
  const onEdit = (row: IAccessCode) => {
    navigate(`${row.id}/edit`);
  };

  const onDelete = (row: IAccessCode) => {
    setShowDeleteAccessCode(row);
  };

  // menu items
  const buildAccessCodeActionColumn = (): TableColumn<IAccessCode> => {
    const accessCodeMenuItems = [
      {
        label: i18n.t('general:edit', { item: '' }),
        icon: <PencilIcon className="menu-icon" />,
        onClick: onEdit,
        ...gate,
      },
      {
        label: i18n.t('general:delete'),
        icon: <TrashIcon className="menu-icon" />,
        onClick: onDelete,
        alert: true,
      },
    ];

    return {
      name: '',
      cell: (row: IAccessCode) => <Popover<IAccessCode> row={row} items={accessCodeMenuItems} />,
      width: '50px',
      allowOverflow: true,
    };
  };

  const confirmDelete = () => {
    if (showDeleteAccessCode) {
      deleteAccessCode(showDeleteAccessCode.id, {
        onSuccess: () => {
          useSuccessToast(i18n.t('access_code:modal.delete'));
          refetch();
        },
        onError: (error) => {
          useErrorToast(
            InternalErrors.ORGANIZATION_ERRORS.getError(error?.response?.data.code_error),
          );
        },
        onSettled: () => {
          setShowDeleteAccessCode(null);
        },
      });
    }
  };

  return (
    <PageLayout>
      <PageHeader
        subtitle={i18n.t('access_code:page.subtitle')}
        actions={
          <Button
            className="btn-primary"
            label={i18n.t('access_code:create')}
            icon={<PlusIcon className="h-5 w-5" aria-hidden="true" />}
            onClick={onAdd}
            {...gate}
          />
        }
      >
        {i18n.t('side_menu:options.access_codes')}
      </PageHeader>
      <Card>
        <CardHeader>
          <div>
            <h2>
              {i18n.t('access_code:page.list_title', {
                count: accessCodes?.meta?.totalItems ?? 0,
              })}
            </h2>
            <p className="text-sm text-cool-gray-500">{i18n.t('access_code:page.list_subtitle')}</p>
          </div>
        </CardHeader>
        <CardBody>
          <DataTableComponent<IAccessCode>
            data={accessCodes?.items}
            columns={[...AccessCodeTableHeader, buildAccessCodeActionColumn()]}
            loading={isAccessCodesLoading || isDeleteAccessCodeLoading}
            pagination
            paginationPerPage={query.limit as number}
            paginationTotalRows={accessCodes?.meta?.totalItems}
            paginationDefaultPage={query.page as number}
            onChangeRowsPerPage={onRowsPerPageChange}
            onChangePage={onChangePage}
            onSort={onSort}
          />
        </CardBody>
      </Card>
      {showDeleteAccessCode && (
        <ConfirmationModal
          title={i18n.t('access_code:modal.title')}
          description={i18n.t('access_code:modal.description')}
          confirmBtnLabel={i18n.t('division:modal.delete.title', {
            division: i18n.t('access_code:name').toLowerCase(),
          })}
          confirmBtnClassName="btn-danger"
          onClose={setShowDeleteAccessCode.bind(null, null)}
          onConfirm={confirmDelete}
        />
      )}
    </PageLayout>
  );
};

export default AccessCodes;
