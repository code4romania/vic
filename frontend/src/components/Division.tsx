import React from 'react';
import { IUser } from '../common/interfaces/user.interface';
import i18n from '../common/config/i18n';
import { formatDate } from '../common/utils/utils';
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
import { PaginationConfig } from '../common/constants/pagination';
import EmptyContent from './EmptyContent';
import LoadingContent from './LoadingContent';
import { SortOrder, TableColumn } from 'react-data-table-component';
import Popover from './Popover';
import { IBaseEntity } from '../common/interfaces/base-entity.interface';
import { IPaginatedEntity } from '../common/interfaces/paginated-entity.interface';
import Tabs from './Tabs';
import { SelectItem } from './Select';

export enum DivisionType {
  Branches = 'branches',
  Departments = 'departments',
  Roles = 'roles',
}

export interface IDivision extends IBaseEntity {
  name: string;
  createdBy: Pick<IUser, 'id' | 'name'>;
  membersCount: number;
  createdOn: Date | string;
}

export const DivisionTabs: SelectItem[] = [
  { key: 0, value: i18n.t('division:branches') },
  { key: 1, value: i18n.t('division:departments') },
  { key: 2, value: i18n.t('division:roles') },
];

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

interface DivisionProps {
  data?: IPaginatedEntity<IDivision>;
  isLoading: boolean;
  divisionType: DivisionType;
  page: number;
  onSort: (column: TableColumn<IDivision>, direction: SortOrder) => void;
  onChangePage: (newPage: number) => void;
  onRowsPerPageChange: (rows: number) => void;
  onTabChange: (id: number) => void;
}

const Division = ({
  data,
  isLoading,
  divisionType,
  page,
  onSort,
  onChangePage,
  onRowsPerPageChange,
  onTabChange,
}: DivisionProps) => {
  // component actions
  const onAdd = () => {
    alert('Not yet implemented');
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

  return (
    <Tabs tabs={DivisionTabs} onClick={onTabChange}>
      <Card>
        <CardHeader>
          <h3>{divisionType}</h3>
          <Button
            className="btn-outline-secondary"
            label={i18n.t('general:add')}
            icon={<PlusIcon className="h-5 w-5" />}
            onClick={onAdd}
          />
        </CardHeader>
        <CardBody>
          <DataTableComponent
            columns={[...DivisionTableHeader, buildDivisionActionColumn()]}
            sortIcon={<ChevronUpDownIcon />}
            data={data?.items}
            loading={isLoading}
            pagination
            paginationPerPage={data?.meta?.itemsPerPage}
            paginationRowsPerPageOptions={PaginationConfig.rowsPerPageOptions}
            paginationTotalRows={data?.meta?.totalItems}
            paginationDefaultPage={page}
            onChangeRowsPerPage={onRowsPerPageChange}
            onChangePage={onChangePage}
            onSort={onSort}
            EmptyContent={<EmptyContent />}
            LoadingContent={<LoadingContent />}
          />
        </CardBody>
      </Card>
    </Tabs>
  );
};

export default Division;
