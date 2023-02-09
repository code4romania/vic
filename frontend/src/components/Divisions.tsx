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
import {
  useAddDivisionMutation,
  useEditDivisionMutation,
  useDeleteDivisionMutation,
} from '../services/division/division.service';
import { useErrorToast, useSuccessToast } from '../hooks/useToast';
import { InternalErrors } from '../common/errors/internal-errors.class';

export enum DivisionType {
  BRANCH = 'Branch',
  DEPARTMENT = 'Department',
  ROLE = 'Role',
}

export interface IDivision extends IBaseEntity {
  name: string;
  createdBy: Pick<IUser, 'id' | 'name'>;
  membersCount: number;
  createdOn: Date | string;
}

export const DivisionsTabs: SelectItem<DivisionType>[] = [
  { key: DivisionType.BRANCH, value: i18n.t(`division:table.title.branch`) },
  { key: DivisionType.DEPARTMENT, value: i18n.t('division:table.title.department') },
  { key: DivisionType.ROLE, value: i18n.t('division:table.title.role') },
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
  isLoading: boolean;
  divisionType: DivisionType;
  data?: IPaginatedEntity<IDivision>;
  page?: number;
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
  const [selectedIdForEdit, setSelectedIdForEdit] = useState<string>();

  const { mutateAsync: deleteDivision } = useDeleteDivisionMutation();
  const { mutateAsync: addDivisionMutation } = useAddDivisionMutation();
  const { mutateAsync: editDivisionMutation, error: editDivisionMutationError } =
    useEditDivisionMutation();

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

  // delete request
  const handleDelete = () => {
    if (selectedIdForDeletion) {
      deleteDivision(selectedIdForDeletion, {
        onSuccess: () => {
          // show success message
          useSuccessToast(
            i18n.t('division:delete.success', {
              division: i18n.t(`division:modal.${divisionType}`),
            }),
          );
          // refresh table
          onRefetch();
        },
        onError: () => {
          // show error message
          useErrorToast(
            i18n.t('division:errors.delete', {
              division: i18n.t(`division:errors.${divisionType}`),
            }),
          );
        },
        onSettled: () => {
          // close modal
          setSelectedIdForDeletion(undefined);
        },
      });
    }
  };

  // simple actions
  const onAdd = () => {
    setIsAddModalOpen(true);
  };

  const onView = (row: IDivision) => {
    alert(`Not yet implemented, ${row}`);
  };

  const onEdit = (row: IDivision) => {
    setSelectedIdForEdit(row.id);
  };

  const onDelete = (row: IDivision) => {
    alert(`Not yet implemented, ${row}`);
  };

  // add division
  const handleAdd = (inputData: DivisionFormTypes) => {
    addDivisionMutation(inputData.name, {
      onSuccess: () => {
        useSuccessToast(i18n.t('division:success.add'));
        onRefetch();
      },
      onError: () => {
        useErrorToast(
          i18n.t('division:errors.generic.add', {
            division: i18n.t(`division:errors.${divisionType}`),
          }),
        );
      },
      onSettled: () => {
        setIsAddModalOpen(false);
      },
    });
  };

  // edit division
  const handleEdit = (inputData: DivisionFormTypes) => {
    if (selectedIdForEdit) {
      editDivisionMutation(
        { id: selectedIdForEdit, name: inputData.name },
        {
          onSuccess: () => {
            useSuccessToast(i18n.t('division:success.edit'));
            onRefetch();
          },
          onError: () => {
            if (editDivisionMutationError)
              useErrorToast(
                InternalErrors.DIVISION_ERRORS.getError(
                  editDivisionMutationError?.response?.data.code_error,
                ),
              );
            else
              useErrorToast(
                i18n.t('division:errors.generic.edit', {
                  division: i18n.t(`division:errors.${divisionType}`),
                }),
              );
          },
          onSettled: () => {
            setSelectedIdForEdit(undefined);
          },
        },
      );
    }
  };

  return (
    <Tabs<DivisionType> tabs={DivisionsTabs} onClick={onTabChange}>
      <Card>
        <CardHeader>
          <h3>{i18n.t(`division:table.title.${divisionType.toLocaleLowerCase()}`)}</h3>
          <Button
            className="btn-outline-secondary"
            label={i18n.t('general:add', { item: i18n.t(`division:modal.${divisionType}`) })}
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
          onClose={setIsAddModalOpen.bind(null, false)}
          onSubmit={handleAdd}
        />
      )}
      {selectedIdForEdit && (
        <DivisionInputModal
          title={i18n.t('general:edit', { item: i18n.t(`division:modal.${divisionType}`) })}
          divisionType={divisionType}
          onClose={setSelectedIdForEdit.bind(null, undefined)}
          onSubmit={handleEdit}
        />
      )}
      {selectedIdForDeletion && (
        <ConfirmationModal
          title={i18n.t('division:modal.delete.title', {
            division: i18n.t(`division:modal.${divisionType}`),
          })}
          description={i18n.t('confirmation:delete', {
            item: i18n.t(`division:modal.${divisionType}`),
          })}
          confirmBtnLabel={i18n.t('general:delete')}
          confirmBtnClassName="btn-danger"
          onClose={setSelectedIdForDeletion.bind(null, undefined)}
          onConfirm={handleDelete}
        />
      )}
      {selectedIdForDeletion && (
        <ConfirmationModal
          title={i18n.t('division:modal.delete.title', {
            division: i18n.t(`division:modal.${divisionType}`),
          })}
          description={i18n.t('confirmation:delete', {
            item: i18n.t(`division:modal.${divisionType}`),
          })}
          confirmBtnLabel={i18n.t('general:delete')}
          confirmBtnClassName="btn-danger"
          onClose={setSelectedIdForDeletion.bind(null, undefined)}
          onConfirm={handleDelete}
        />
      )}
    </Tabs>
  );
};

export default Divisions;
