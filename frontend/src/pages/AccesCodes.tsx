import { PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { SortOrder, TableColumn } from 'react-data-table-component';
import { useNavigate } from 'react-router-dom';
import i18n from '../common/config/i18n';
import { OrderDirection } from '../common/enums/order-direction.enum';
import { IUser } from '../common/interfaces/user.interface';
import { formatDate } from '../common/utils/utils';
import Button from '../components/Button';
import CardBody from '../components/CardBody';
import CardHeader from '../components/CardHeader';
import DataTableComponent from '../components/DataTableComponent';
import Popover from '../components/Popover';
import { useErrorToast } from '../hooks/useToast';
import Card from '../layouts/CardLayout';
import CellLayout from '../layouts/CellLayout';
import PageLayout from '../layouts/PageLayout';
import { useAccessCodesQuery } from '../services/organization/organization.service';

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
    id: 'name',
    name: i18n.t('access_code:name'),
    sortable: true,
    grow: 1,
    minWidth: '5rem',
    selector: (row: IAccessCode) => row.code,
  },
  {
    id: 'availability',
    name: i18n.t('general:availability'),
    sortable: true,
    grow: 2,
    minWidth: '10rem',
    selector: (row: IAccessCode) => `${formatDate(row.startDate)} -\n${formatDate(row.endDate)}`,
  },
  {
    id: 'uses',
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
    selector: (row: IAccessCode) => formatDate(row.createdOn),
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

const AccessCodes = () => {
  const [page, setPage] = useState<number>();
  const [rowsPerPage, setRowsPerPage] = useState<number>();
  const [orderByColumn, setOrderByColumn] = useState<string>();
  const [orderDirection, setOrderDirection] = useState<OrderDirection>();
  const navigate = useNavigate();

  const {
    data: accessCodes,
    error,
    isLoading,
  } = useAccessCodesQuery(
    rowsPerPage as number,
    page as number,
    orderByColumn as string,
    orderDirection as OrderDirection,
  );

  useEffect(() => {
    if (accessCodes?.meta) {
      setPage(accessCodes.meta.currentPage);
      setRowsPerPage(accessCodes.meta.itemsPerPage);
      setOrderByColumn(accessCodes.meta.orderByColumn);
      setOrderDirection(accessCodes.meta.orderDirection);
    }
  }, []);

  useEffect(() => {
    if (error) useErrorToast(i18n.t('general:error.load_entries'));
  }, [error]);

  // pagination
  const onRowsPerPageChange = (rows: number) => {
    setRowsPerPage(rows);
  };

  const onChangePage = (newPage: number) => {
    setPage(newPage);
  };

  const onSort = (column: TableColumn<IAccessCode>, direction: SortOrder) => {
    setOrderByColumn(column.id as string);
    setOrderDirection(
      direction.toLocaleUpperCase() === OrderDirection.ASC
        ? OrderDirection.ASC
        : OrderDirection.DESC,
    );
  };

  // component actions
  const onAdd = () => {
    navigate('add');
  };

  // row actions
  const onEdit = (row: IAccessCode) => {
    navigate(`edit/${row.id}`);
  };

  const onDelete = (row: IAccessCode) => {
    alert(`Not yet implemented, ${row}`);
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
              loading={isLoading}
              pagination
              paginationPerPage={accessCodes?.meta?.itemsPerPage}
              paginationTotalRows={accessCodes?.meta?.totalItems}
              paginationDefaultPage={page}
              onChangeRowsPerPage={onRowsPerPageChange}
              onChangePage={onChangePage}
              onSort={onSort}
            />
          </CardBody>
        </Card>
      </div>
    </PageLayout>
  );
};

export default AccessCodes;
