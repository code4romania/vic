import { EyeIcon, PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { SortOrder, TableColumn } from 'react-data-table-component';
import i18n from '../common/config/i18n';
import { DivisionType } from '../common/enums/division-type.enum';
import { OrderDirection } from '../common/enums/order-direction.enum';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { IDivision } from '../common/interfaces/division.interface';
import { formatDate } from '../common/utils/utils';
import { useErrorToast, useSuccessToast } from '../hooks/useToast';
import Card from '../layouts/CardLayout';
import CellLayout from '../layouts/CellLayout';
import {
  useAddDivisionMutation,
  useDeleteDivisionMutation,
  useDivisions,
  useEditDivisionMutation,
} from '../services/division/division.service';
import Button from './Button';
import CardBody from './CardBody';
import CardHeader from './CardHeader';
import ConfirmationModal from './ConfirmationModal';
import DataTableComponent from './DataTableComponent';
import DivisionInputModal, { DivisionFormTypes } from './DivisionInputModal';
import Popover from './Popover';

export const DivisionTableHeader = [
  {
    id: 'name',
    name: i18n.t('general:name'),
    sortable: true,
    minWidth: '10rem',
    selector: (row: IDivision) => row.name,
  },
  {
    id: 'numberOfMembers',
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

interface DivisionTableProps {
  type: DivisionType;
}

const DivisionTable = ({ type }: DivisionTableProps) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [selectedDivisionForUpdate, setSelectedDivisionForUpdate] = useState<IDivision>();
  const [selectedIdForDeletion, setSelectedIdForDeletion] = useState<string>();
  const [rowsPerPage, setRowsPerPage] = useState<number>();
  const [orderByColumn, setOrderByColumn] = useState<string>();
  const [orderDirection, setOrderDirection] = useState<OrderDirection>(OrderDirection.ASC);
  const [page, setPage] = useState<number>();

  const {
    data: divisions,
    isLoading: isFetchingDivisions,
    error: divisionError,
    refetch,
  } = useDivisions(rowsPerPage as number, page as number, type, orderByColumn, orderDirection);

  const { mutateAsync: addDivisionMutation, isLoading: addDivisionMutationLoading } =
    useAddDivisionMutation();

  const { mutateAsync: editDivisionMutation, isLoading: editDivisionMutationLoading } =
    useEditDivisionMutation();

  const { mutateAsync: deleteDivision, isLoading: deleteDivisionMutationLoading } =
    useDeleteDivisionMutation();

  // error handling
  useEffect(() => {
    // map error messages for DIVISIONS fetch
    if (divisionError) {
      useErrorToast(
        InternalErrors.DIVISION_ERRORS.getError(divisionError.response?.data.code_error),
      );
    }
  }, [divisionError]);

  // menu items
  const buildDivisionActionColumn = (): TableColumn<IDivision> => {
    const divisionMenuItems = [
      {
        label: i18n.t('division:popover.view'),
        icon: <EyeIcon className="menu-icon" />,
        onClick: onView,
      },
      {
        label: i18n.t('division:popover.edit'),
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
      cell: (row: IDivision) => <Popover<IDivision> row={row} items={divisionMenuItems} />,
      width: '50px',
      allowOverflow: true,
    };
  };

  // pagination
  const onRowsPerPageChange = (rows: number) => {
    setRowsPerPage(rows);
  };

  const onChangePage = (newPage: number) => {
    setPage(newPage);
  };

  const onSort = (column: TableColumn<IDivision>, direction: SortOrder) => {
    setOrderByColumn(column.id as string);
    setOrderDirection(
      direction.toLocaleUpperCase() === OrderDirection.ASC
        ? OrderDirection.ASC
        : OrderDirection.DESC,
    );
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
      { name, type },
      {
        onSuccess: () => {
          useSuccessToast(i18n.t(`division:submit.success.${type}.add`));
          refetch();
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
            useSuccessToast(i18n.t(`division:submit.success.${type}.edit`));
            refetch();
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
          useSuccessToast(i18n.t(`division:submit.success.${type}.delete`));
          // refresh table
          refetch();
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
    <>
      <Card>
        <CardHeader>
          <h3>{i18n.t(`division:table.title.${type}`)}</h3>
          <Button
            className="btn-outline-secondary"
            label={i18n.t('general:add', {
              item: i18n.t(`division:entity.${type}`).toLowerCase(),
            })}
            icon={<PlusIcon className="h-5 w-5" />}
            onClick={onAdd}
          />
        </CardHeader>
        <CardBody>
          <DataTableComponent<IDivision>
            columns={[...DivisionTableHeader, buildDivisionActionColumn()]}
            data={divisions?.items}
            loading={
              isFetchingDivisions ||
              addDivisionMutationLoading ||
              editDivisionMutationLoading ||
              deleteDivisionMutationLoading
            }
            pagination
            paginationPerPage={divisions?.meta?.itemsPerPage}
            paginationTotalRows={divisions?.meta?.totalItems}
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
            item: i18n.t(`division:entity.${type}`).toLowerCase(),
          })}
          divisionType={type}
          onClose={setIsAddModalOpen.bind(null, false)}
          onSubmit={onSubmitDivision}
        />
      )}
      {selectedDivisionForUpdate && (
        <DivisionInputModal
          title={i18n.t('general:edit', { item: i18n.t(`division:entity.${type}`).toLowerCase() })}
          divisionType={type}
          onClose={setSelectedDivisionForUpdate.bind(null, undefined)}
          onSubmit={onUpdateDivision}
          defaultValue={selectedDivisionForUpdate.name}
        />
      )}
      {selectedIdForDeletion && (
        <ConfirmationModal
          title={i18n.t('division:modal.delete.title', {
            division: i18n.t(`division:entity.${type}`),
          })}
          description={i18n.t('general:confirm_delete', {
            item: i18n.t(`division:entity.${type}`),
          })}
          confirmBtnLabel={i18n.t('general:delete')}
          confirmBtnClassName="btn-danger"
          onClose={setSelectedIdForDeletion.bind(null, undefined)}
          onConfirm={onDeleteDivision}
        />
      )}
    </>
  );
};

export default DivisionTable;
