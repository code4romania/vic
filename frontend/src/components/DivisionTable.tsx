import { EyeIcon, PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { SortOrder, TableColumn } from 'react-data-table-component';
import i18n from '../common/config/i18n';
import { DivisionType } from '../common/enums/division-type.enum';
import { OrderDirection } from '../common/enums/order-direction.enum';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { IDivision } from '../common/interfaces/division.interface';
import { formatDate } from '../common/utils/utils';
import { DivisionTableProps } from '../containers/query/DivisionTableWithQueryParams';
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
import LinkCell from './LinkCell';
import { useNavigate } from 'react-router';

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
      <LinkCell href={`/actions-archive?author=${row.createdBy.name}`}>
        {row.createdBy.name}
      </LinkCell>
    ),
  },
  {
    id: 'createdOn',
    name: i18n.t('general:created_on'),
    sortable: true,
    minWidth: '5rem',
    cell: (row: IDivision) => <CellLayout>{formatDate(row.createdOn)}</CellLayout>,
  },
];

const DivisionTable = ({ query, setQuery }: DivisionTableProps) => {
  // modals states
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [selectedDivisionForUpdate, setSelectedDivisionForUpdate] = useState<IDivision>();
  const [selectedIdForDeletion, setSelectedIdForDeletion] = useState<string>();

  const navigate = useNavigate();

  // divisions query
  const {
    data: divisions,
    isLoading: isFetchingDivisions,
    error: divisionError,
    refetch,
  } = useDivisions(
    query?.limit as number,
    query?.page as number,
    query?.type as DivisionType,
    query?.orderBy as string,
    query?.orderDirection as OrderDirection,
  );

  // division mutation
  const { mutateAsync: addDivisionMutation, isLoading: addDivisionMutationLoading } =
    useAddDivisionMutation();

  const { mutateAsync: editDivisionMutation, isLoading: editDivisionMutationLoading } =
    useEditDivisionMutation();

  const { mutateAsync: deleteDivision, isLoading: deleteDivisionMutationLoading } =
    useDeleteDivisionMutation();

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
    setQuery({
      limit: rows,
      page: 1,
    });
  };

  const onChangePage = (newPage: number) => {
    setQuery({
      page: newPage,
    });
  };

  const onSort = (column: TableColumn<IDivision>, direction: SortOrder) => {
    setQuery({
      orderBy: column.id as string,
      orderDirection:
        direction.toLocaleUpperCase() === OrderDirection.ASC
          ? OrderDirection.ASC
          : OrderDirection.DESC,
    });
  };

  // simple actions
  const onAdd = () => {
    setIsAddModalOpen(true);
  };

  const onEdit = (row: IDivision) => {
    setSelectedDivisionForUpdate(row);
  };

  const onView = (row: IDivision) => {
    navigate(`/volunteers?${row.type}=${row.name}`);
  };

  const onDelete = (row: IDivision) => {
    setSelectedIdForDeletion(row.id);
  };

  // add division
  const onSubmitDivision = ({ name }: DivisionFormTypes) => {
    addDivisionMutation(
      { name, type: query?.type as DivisionType },
      {
        onSuccess: () => {
          useSuccessToast(i18n.t(`division:submit.success.${query.type}.add`));
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
            useSuccessToast(i18n.t(`division:submit.success.${query.type}.edit`));
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
          useSuccessToast(i18n.t(`division:submit.success.${query.type}.delete`));
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
          <h3>{i18n.t(`division:table.title.${query.type}`)}</h3>
          <Button
            className="btn-outline-secondary"
            label={i18n.t('general:add', {
              item: i18n.t(`division:entity.${query.type}`).toLowerCase(),
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
            paginationPerPage={query.limit}
            paginationTotalRows={divisions?.meta?.totalItems}
            paginationDefaultPage={query.page as number}
            onChangeRowsPerPage={onRowsPerPageChange}
            onChangePage={onChangePage}
            onSort={onSort}
          />
        </CardBody>
      </Card>
      {isAddModalOpen && (
        <DivisionInputModal
          title={i18n.t('general:add', {
            item: i18n.t(`division:entity.${query.type}`).toLowerCase(),
          })}
          divisionType={query.type as DivisionType}
          onClose={setIsAddModalOpen.bind(null, false)}
          onSubmit={onSubmitDivision}
        />
      )}
      {selectedDivisionForUpdate && (
        <DivisionInputModal
          title={i18n.t('general:edit', {
            item: i18n.t(`division:entity.${query.type}`).toLowerCase(),
          })}
          divisionType={query.type as DivisionType}
          onClose={setSelectedDivisionForUpdate.bind(null, undefined)}
          onSubmit={onUpdateDivision}
          defaultValue={selectedDivisionForUpdate.name}
        />
      )}
      {selectedIdForDeletion && (
        <ConfirmationModal
          title={i18n.t('division:modal.delete.title', {
            division: i18n.t(`division:entity.${query.type}`),
          })}
          description={i18n.t('general:confirm_delete', {
            item: i18n.t(`division:entity.${query.type}`),
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
