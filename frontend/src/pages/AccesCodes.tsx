import { PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
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
import Card from '../layouts/CardLayout';
import CellLayout from '../layouts/CellLayout';
import PageLayout from '../layouts/PageLayout';
import {
  useAccessCodesQuery,
  useDeleteAccessCodeMutation,
} from '../services/organization/organization.service';
import { AccessCodesProps } from '../containers/query/AccessCodesWithQueryParams';
export interface IAccessCode {
  id: string;
  code: string;
  startDate: Date;
  endDate: Date;
  usageCount: number;
  createdOn: Date;
  createdBy: IUser;
}

const AccessCodeTableHeader = [
  {
    id: 'code',
    name: i18n.t('access_code:name'),
    sortable: true,
    grow: 1,
    minWidth: '5rem',
    selector: (row: IAccessCode) => row.code,
  },
  {
    id: 'startDate',
    name: i18n.t('general:availability'),
    sortable: true,
    grow: 2,
    minWidth: '10rem',
    cell: (row: IAccessCode) => (
      <CellLayout>{`${formatDate(row.startDate)} -\n${
        row.endDate ? `${formatDate(row.endDate)}` : i18n.t('general:unlimited')
      }`}</CellLayout>
    ),
  },
  {
    id: 'usageCount',
    name: i18n.t('general:uses'),
    sortable: true,
    grow: 1,
    minWidth: '2rem',
    selector: (row: IAccessCode) => row.usageCount,
  },
  {
    id: 'createdOn',
    name: i18n.t('general:created_on'),
    sortable: true,
    grow: 1,
    minWidth: '5rem',
    cell: (row: IAccessCode) => <CellLayout>{formatDate(row.createdOn)}</CellLayout>,
  },
  {
    id: 'createdBy.name',
    name: i18n.t('general:created_by'),
    sortable: true,
    grow: 1,
    minWidth: '5rem',
    cell: (row: IAccessCode) => (
      <CellLayout>
        <a>{row.createdBy.name}</a>
      </CellLayout>
    ),
  },
];

const AccessCodes = ({ query, setQuery }: AccessCodesProps) => {
  const [showDeleteAccessCode, setShowDeleteAccessCode] = useState<null | IAccessCode>();
  const navigate = useNavigate();

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
    setQuery({
      limit,
      page: 1,
    });
  };

  const onChangePage = (page: number) => {
    setQuery({ page });
  };

  const onSort = (column: TableColumn<IAccessCode>, direction: SortOrder) => {
    setQuery({
      orderBy: column.id as string,
      orderDirection:
        direction.toLocaleUpperCase() === OrderDirection.ASC
          ? OrderDirection.ASC
          : OrderDirection.DESC,
    });
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
      <div className="flex flex-col gap-6">
        <div className="flex flex-row justify-between">
          <h1>{i18n.t('side_menu:options.access_codes')}</h1>
          <Button
            className="btn-primary"
            label={i18n.t('access_code:create')}
            icon={<PlusIcon className="h-5 w-5" />}
            onClick={onAdd}
          />
        </div>
        <Card>
          <CardHeader>
            <h3 className="font-titilliumBold">{i18n.t('side_menu:options.access_codes')}</h3>
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
      </div>
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
