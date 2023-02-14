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
import CellLayout from '../layouts/CellLayout';

export enum DivisionType {
  BRANCH = 'Branch',
  DEPARTMENT = 'Department',
  ROLE = 'Role',
}

export interface IDivision {
  id: string;
  name: string;
  type: DivisionType;
  createdBy: IUser;
  numberOfMembers: number;
  createdOn: Date;
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
    minWidth: '10rem',
    selector: (row: IDivision) => row.name,
  },
  {
    id: 'membersCount',
    name: i18n.t('division:members'),
    sortable: true,
    minWidth: '2rem',
    selector: (row: IDivision) => row.numberOfMembers,
  },
  {
    id: 'createdBy.name',
    name: i18n.t('general:created_by'),
    sortable: true,
    minWidth: '10rem',
    cell: (row: IDivision) => (
      <CellLayout>
        <a>{row.createdBy.name}</a>
      </CellLayout>
    ),
  },
  {
    id: 'createdOn',
    name: i18n.t('general:created_on'),
    sortable: true,
    minWidth: '5rem',
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
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [selectedDivisionForUpdate, setSelectedDivisionForUpdate] = useState<IDivision>();
  const [selectedIdForDeletion, setSelectedIdForDeletion] = useState<string>();

  const { mutateAsync: addDivisionMutation, isLoading: addDivisionMutationLoading } =
    useAddDivisionMutation();

  const { mutateAsync: editDivisionMutation, isLoading: editDivisionMutationLoading } =
    useEditDivisionMutation();

  const { mutateAsync: deleteDivision, isLoading: deleteDivisionMutationLoading } =
    useDeleteDivisionMutation();

  // menu items
  const buildDivisionActionColumn = (): TableColumn<IDivision> => {
    const divisionMenuItems = [
      {
        label: i18n.t('general:view'),
        icon: <EyeIcon className="menu-icon" />,
        onClick: onView,
      },
      {
        label: i18n.t('general:edit', {
          item: i18n.t(`division:entity.${divisionType.toLocaleLowerCase()}`),
        }),
        icon: <PencilIcon className="menu-icon" />,
        onClick: onEdit,
      },
      {
        label: i18n.t('division:modal.delete.title', {
          division: i18n.t(`division:entity.${divisionType.toLocaleLowerCase()}`),
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
  const onAdd = () => {
    setIsAddModalOpen(true);
  };

  const onEdit = (row: IDivision) => {
    setSelectedDivisionForUpdate(row);
  };

  const onView = (row: IDivision) => {
    alert(`Not yet implemented, ${row}`);
  };

  const onDelete = (row: IDivision) => {
    setSelectedIdForDeletion(row.id);
  };

  // add division
  const onSubmitDivision = ({ name }: DivisionFormTypes) => {
    addDivisionMutation(
      { name, type: divisionType },
      {
        onSuccess: () => {
          useSuccessToast(
            i18n.t('division:messages.add', {
              division: i18n.t(`division:entity.${divisionType.toLocaleLowerCase()}`),
            }),
          );
          onRefetch();
        },
        onError: (error) => {
          useErrorToast(InternalErrors.DIVISION_ERRORS.getError(error.response?.data.code_error));
        },
        onSettled: () => {
          setIsAddModalOpen(false);
        },
      },
    );
  };

  // edit division
  const onUpdateDivision = (inputData: DivisionFormTypes) => {
    if (selectedDivisionForUpdate) {
      editDivisionMutation(
        { id: selectedDivisionForUpdate.id, name: inputData.name },
        {
          onSuccess: () => {
            useSuccessToast(
              i18n.t('division:messages.edit', {
                division: i18n.t(`division:entity.${divisionType.toLocaleLowerCase()}`),
              }),
            );
            onRefetch();
          },
          onError: (error) => {
            useErrorToast(
              InternalErrors.DIVISION_ERRORS.getError(error?.response?.data.code_error),
            );
          },
          onSettled: () => {
            setSelectedDivisionForUpdate(undefined);
          },
        },
      );
    }
  };

  // delete request
  const onDeleteDivision = () => {
    if (selectedIdForDeletion) {
      deleteDivision(selectedIdForDeletion, {
        onSuccess: () => {
          // show success message
          useSuccessToast(
            i18n.t('division:modal.delete.success', {
              division: i18n.t(`division:entity.${divisionType.toLocaleLowerCase()}`),
            }),
          );
          // refresh table
          onRefetch();
        },
        onError: (error) => {
          useErrorToast(InternalErrors.DIVISION_ERRORS.getError(error.response?.data.code_error));
        },
        onSettled: () => {
          // close modal
          setSelectedIdForDeletion(undefined);
        },
      });
    }
  };

  return (
    <Tabs<DivisionType> tabs={DivisionsTabs} onClick={onTabChange}>
      <Card>
        <CardHeader>
          <h3>{i18n.t(`division:table.title.${divisionType.toLocaleLowerCase()}`)}</h3>
          <Button
            className="btn-outline-secondary"
            label={i18n.t('general:add', {
              item: i18n.t(`division:entity.${divisionType.toLocaleLowerCase()}`),
            })}
            icon={<PlusIcon className="h-5 w-5" />}
            onClick={onAdd}
          />
        </CardHeader>
        <CardBody>
          <DataTableComponent<IDivision>
            columns={[...DivisionTableHeader, buildDivisionActionColumn()]}
            data={data?.items}
            loading={
              isLoading ||
              addDivisionMutationLoading ||
              editDivisionMutationLoading ||
              deleteDivisionMutationLoading
            }
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
          title={i18n.t('general:add', {
            item: i18n.t(`division:entity.${divisionType.toLocaleLowerCase()}`),
          })}
          divisionType={divisionType}
          onClose={setIsAddModalOpen.bind(null, false)}
          onSubmit={onSubmitDivision}
        />
      )}
      {selectedDivisionForUpdate && (
        <DivisionInputModal
          title={i18n.t('general:edit', { item: i18n.t(`division:modal.${divisionType}`) })}
          divisionType={divisionType}
          onClose={setSelectedDivisionForUpdate.bind(null, undefined)}
          onSubmit={onUpdateDivision}
          defaultValue={selectedDivisionForUpdate.name}
        />
      )}
      {selectedIdForDeletion && (
        <ConfirmationModal
          title={i18n.t('division:modal.delete.title', {
            division: i18n.t(`division:entity.${divisionType.toLocaleLowerCase()}`),
          })}
          description={i18n.t('confirmation:delete', {
            item: i18n.t(`division:entity.${divisionType.toLocaleLowerCase()}`),
          })}
          confirmBtnLabel={i18n.t('general:delete')}
          confirmBtnClassName="btn-danger"
          onClose={setSelectedIdForDeletion.bind(null, undefined)}
          onConfirm={onDeleteDivision}
        />
      )}
    </Tabs>
  );
};

export default Divisions;
