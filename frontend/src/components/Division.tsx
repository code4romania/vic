import React, { useEffect, useState } from 'react';
import { IUsername } from '../common/interfaces/username.interface';
import i18n from '../common/config/i18n';
import { classNames, formatDate } from '../common/utils/utils';
import Card from '../layouts/CardLayout';
import CardHeader from './CardHeader';
import CardBody from './CardBody';
import {
  ChevronUpDownIcon,
  EyeIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import Button from './Button';
import DataTableComponent from './DataTableComponent';
import { PaginationConfig } from '../common/config/pagination.config';
import { useDivisionDataQuery } from '../services/test/test.service';
import { OrderDirection } from '../common/enums/sort-direction.enum';
import EmptyContent from './EmptyContent';
import LoadingContent from './LoadingContent';
import { SortOrder, TableColumn } from 'react-data-table-component';
import Popover from './Popover';
import { IBaseEntity } from '../common/interfaces/base-entity.interface';
import { useErrorToast } from '../hooks/useToast';

export enum DivisionType {
  Branch = 'branch',
  Department = 'department',
  Role = 'role',
}

export interface IDivision extends IBaseEntity {
  name: string;
  createdBy: IUsername;
  membersCount: number;
}

export const DivisionTableHeader = [
  {
    id: 'name',
    name: i18n.t('general:name'),
    sortable: true,
    grow: 2,
    minWidth: '15rem',
    selector: (row: IDivision) => row.name,
  },
  {
    id: 'membersCount',
    name: i18n.t('division:members'),
    sortable: true,
    grow: 2,
    minWidth: '15rem',
    selector: (row: IDivision) => row.membersCount,
  },
  {
    id: 'createdBy.name',
    name: i18n.t('general:created_by'),
    sortable: true,
    grow: 2,
    minWidth: '15rem',
    selector: (row: IDivision) => row.createdBy.name,
  },
  {
    id: 'createdOn',
    name: i18n.t('general:created_on'),
    sortable: true,
    grow: 2,
    minWidth: '15rem',
    selector: (row: IDivision) => formatDate(row.createdOn),
  },
];

const testData: IDivision[] = [
  {
    id: '1',
    name: 'Altex',
    membersCount: 20,
    createdBy: {
      id: '1',
      name: 'Mariana',
    },
    createdOn: '2022, 02, 14',
    updatedOn: '2022, 02, 14',
    deletedOn: '2022, 02, 14',
  },
  {
    id: '2',
    name: 'Emag',
    membersCount: 30,
    createdBy: {
      id: '2',
      name: 'Andrei',
    },
    createdOn: '2022, 10, 14',
    updatedOn: '2022, 02, 14',
    deletedOn: '2022, 02, 14',
  },
  {
    id: '3',
    name: 'Apple',
    membersCount: 9,
    createdBy: {
      id: '3',
      name: 'Elena',
    },
    createdOn: '2023, 10, 07',
    updatedOn: '2022, 02, 14',
    deletedOn: '2022, 02, 14',
  },
  {
    id: '4',
    name: 'Orange',
    membersCount: 34,
    createdBy: {
      id: '4',
      name: 'Mario',
    },
    createdOn: '2022, 11, 20',
    updatedOn: '2022, 02, 14',
    deletedOn: '2022, 02, 14',
  },
];

interface DivisionProps {
  divisionType: DivisionType;
}

const Division = ({ divisionType }: DivisionProps) => {
  const [page, setPage] = useState<number>();
  const [rowsPerPage, setRowsPerPage] = useState<number>();
  const [orderByColumn, setOrderByColumn] = useState<string>();
  const [orderDirection, setOrderDirection] = useState<OrderDirection>();

  const {
    data: divisionData,
    isLoading,
    error,
  } = useDivisionDataQuery(
    rowsPerPage as number,
    page as number,
    orderByColumn as string,
    orderDirection as OrderDirection,
    divisionType,
  );

  useEffect(() => {
    if (divisionData?.meta) {
      setPage(divisionData.meta.currentPage);
      setRowsPerPage(divisionData.meta.itemsPerPage);
      setOrderByColumn(divisionData.meta.orderByColumn);
      setOrderDirection(divisionData.meta.orderDirection);
    }
  }, []);

  useEffect(() => {
    if (error) useErrorToast(i18n.t('general:load_error'));
  }, [error]);

  const onSort = (column: TableColumn<IDivision>, direction: SortOrder) => {
    console.log(column);
    setOrderByColumn(column.id as string);
    setOrderDirection(
      direction.toLocaleUpperCase() === OrderDirection.ASC
        ? OrderDirection.ASC
        : OrderDirection.DESC,
    );
  };

  // row actions
  const onView = (row: IDivision) => {
    alert(`Not yet implemented, ${row}`);
  };

  const onEdit = (row: IDivision) => {
    alert(`Not yet implemented, ${row}`);
  };

  const onDelete = (row: IDivision) => {
    alert(`Not yet implemented, ${row}`);
  };

  // menu items
  const buildDivisionActionColumn = (): TableColumn<IDivision> => {
    const divisionMenuItems = [
      {
        label: i18n.t('general:view'),
        icon: <EyeIcon className="menu-icon" />,
        onClick: onView,
      },
      {
        label: i18n.t('general:edit'),
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
      cell: (row: IDivision) => <Popover row={row} items={divisionMenuItems} />,
      width: '50px',
      allowOverflow: true,
    };
  };

  // other functions
  const onAdd = () => {
    alert('Not yet implemented');
  };

  // pagination
  const onRowsPerPageChange = (rows: number) => {
    setRowsPerPage(rows);
  };

  const onChangePage = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <Card>
      <CardHeader>
        <h3>{i18n.t(`division:${divisionType}`)}</h3>
        <Button
          className="btn-outline-secondary"
          label={i18n.t('general:add')}
          icon={<PlusIcon className="h-5 w-5" />}
          onClick={onAdd}
        />
      </CardHeader>
      <CardBody>
        <DataTableComponent
          className={classNames(
            !isLoading && divisionData?.items?.length ? 'border-cool-gray-200' : '',
            'rdt_TableWrapper',
          )}
          columns={[...DivisionTableHeader, buildDivisionActionColumn()]}
          sortIcon={<ChevronUpDownIcon />}
          data={testData || []}
          loading={isLoading}
          pagination
          paginationPerPage={testData.length / 10}
          paginationRowsPerPageOptions={PaginationConfig.rowsPerPageOptions}
          paginationTotalRows={testData.length}
          paginationDefaultPage={page}
          onChangeRowsPerPage={onRowsPerPageChange}
          onChangePage={onChangePage}
          onSort={onSort}
          EmptyContent={<EmptyContent />}
          LoadingContent={<LoadingContent />}
        />
      </CardBody>
    </Card>
  );
};

export default Division;
