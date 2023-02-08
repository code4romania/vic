import React, { useState } from 'react';
import { IUser } from '../common/interfaces/user.interface';
import i18n from '../common/config/i18n';
import { formatDate } from '../common/utils/utils';
import Card from '../layouts/CardLayout';
import CardHeader from './CardHeader';
import CardBody from './CardBody';
import { EyeIcon, PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import Button from './Button';
import DataTableComponent from './DataTableComponent';
import { PaginationConfig } from '../common/constants/pagination';
import { SortOrder, TableColumn } from 'react-data-table-component';
import Popover from './Popover';
import { IBaseEntity } from '../common/interfaces/base-entity.interface';
import { IPaginatedEntity } from '../common/interfaces/paginated-entity.interface';
import Tabs from './Tabs';
import DivisionInputModal, { DivisionFormTypes } from './DivisionInputModal';
import { SelectItem } from './Select';
import ConfirmationModal from './ConfirmationModal';
import { useDeleteDivisionMutation } from '../services/division/division.service';
import { useErrorToast, useSuccessToast } from '../hooks/useToast';

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

export const DivisionsTabs: SelectItem<DivisionType>[] = [
  { key: DivisionType.Branches, value: i18n.t('division:branches') },
  { key: DivisionType.Departments, value: i18n.t('division:departments') },
  { key: DivisionType.Roles, value: i18n.t('division:roles') },
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
    cell: (row: IDivision) => <a>{row.createdBy.name}</a>,
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

interface DivisionsProps {
  data?: IPaginatedEntity<IDivision>;
  isLoading: boolean;
  divisionType: DivisionType;
  page: number;
  onSort: (column: TableColumn<IDivision>, direction: SortOrder) => void;
  onChangePage: (newPage: number) => void;
  onRowsPerPageChange: (rows: number) => void;
  onTabChange: (id: DivisionType) => void;
  onRefetch: () => void;
}

const Divisions = ({
  data,
  isLoading,
  divisionType,
  page,
  onSort,
  onChangePage,
  onRowsPerPageChange,
  onTabChange,
  onRefetch,
}: DivisionsProps) => {
  const [selectedIdForDeletion, setSelectedIdForDeletion] = useState<string>();
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  const { mutateAsync: deleteDivision } = useDeleteDivisionMutation();

  // menu items
  const buildDivisionActionColumn = (): TableColumn<IDivision> => {
    const divisionMenuItems = [
      {
        label: i18n.t('general:view'),
        icon: <EyeIcon className="menu-icon" />,
        onClick: onView,
      },
      {
        label: i18n.t('general:edit', { item: i18n.t(`division:modal.${divisionType}`) }),
        icon: <PencilIcon className="menu-icon" />,
        onClick: onEdit,
      },
      {
        label: i18n.t('division:modal.delete.title', {
          division: i18n.t(`division:modal.${divisionType}`),
        }),
        icon: <TrashIcon className="menu-icon" />,
        onClick: onDelete,
        alert: true,
      },
    ];

    return {
      name: '',
      cell: (row: IDivision) => <Popover<IDivision> row={row} items={divisionMenuItems} />,
      width: '50px',
      allowOverflow: true,
    };
  };

  // simple actions
  const onView = (row: IDivision) => {
    alert(`Not yet implemented, ${row}`);
  };

  const onEdit = (row: IDivision) => {
    console.log(`Not yet implemented, ${row}`);
    setIsEditModalOpen(true);
  };

  const onDelete = (row: IDivision) => {
    setSelectedIdForDeletion(row.id);
  };

  const onAdd = () => {
    console.log('Not yet implemented');
    setIsAddModalOpen(true);
  };

  // delete request
  const handleDelete = () => {
    if (selectedIdForDeletion) {
      deleteDivision(selectedIdForDeletion, {
        onSuccess: () => {
          // show success message
          useSuccessToast(i18n.t('division:delete.success'));
          // refresh table
          onRefetch();
        },
        onError: () => {
          // show error message
          useErrorToast(i18n.t('division:errors.delete'));
        },
        onSettled: () => {
          // close modal
          setSelectedIdForDeletion(undefined);
        },
      });
    }
  };

  const addDivision = (inputData: DivisionFormTypes) => {
    console.log(inputData);
    onRefetch();
    setIsAddModalOpen(false);
  };

  const editDivision = (inputData: DivisionFormTypes) => {
    console.log(inputData);
    onRefetch();
    setIsEditModalOpen(false);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
  };

  return (
    <Tabs<DivisionType> tabs={DivisionsTabs} onClick={onTabChange}>
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
          <DataTableComponent<IDivision>
            columns={[...DivisionTableHeader, buildDivisionActionColumn()]}
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
          />
        </CardBody>
      </Card>
      {isAddModalOpen && (
        <DivisionInputModal
          title={i18n.t('general:add', { item: i18n.t(`division:modal.${divisionType}`) })}
          divisionType={divisionType}
          onClose={closeAddModal}
          onSubmit={addDivision}
        />
      )}
      {isEditModalOpen && (
        <DivisionInputModal
          title={i18n.t('general:edit', { item: i18n.t(`division:modal.${divisionType}`) })}
          divisionType={divisionType}
          onClose={closeEditModal}
          onSubmit={editDivision}
        />
      )}
      {selectedIdForDeletion && (
        <ConfirmationModal
          title={i18n.t('division:modal.delete.title', {
            division: i18n.t(`division:modal.${divisionType}`),
          })}
          description={i18n.t('division:modal.delete.description')}
          confirmBtnLabel={i18n.t('general:delete')}
          confirmBtnClassName="btn-danger"
          onClose={setSelectedIdForDeletion.bind(null, '')}
          onConfirm={handleDelete}
        />
      )}
    </Tabs>
  );
};

export default Divisions;
