import React, { useEffect, useState } from 'react';
import { SortOrder, TableColumn } from 'react-data-table-component';
import i18n from '../common/config/i18n';
import { OrderDirection } from '../common/enums/order-direction.enum';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { IAction } from '../common/interfaces/action.interface';
import { formatDateWithTime } from '../common/utils/utils';
import CardBody from '../components/CardBody';
import CardHeader from '../components/CardHeader';
import DataTableComponent from '../components/DataTableComponent';
import PageHeader from '../components/PageHeader';
import { useErrorToast } from '../hooks/useToast';
import Card from '../layouts/CardLayout';
import PageLayout from '../layouts/PageLayout';
import { useActionsQuery } from '../services/actions/actions.service';

const TableHeader = [
  {
    id: 'eventName',
    name: i18n.t('general:name'),
    sortable: true,
    grow: 2,
    minWidth: '10rem',
    selector: (row: IAction) => row.eventName,
  },

  {
    id: 'author.name',
    name: i18n.t('general:contact'),
    sortable: true,
    grow: 1,
    minWidth: '5rem',
    selector: (row: IAction) => row.author.name,
  },
  {
    id: 'eventData',
    name: i18n.t('volunteers:location'),
    sortable: true,
    grow: 1,
    minWidth: '5rem',
    selector: (row: IAction) => `${row.eventData}`,
  },
  {
    id: 'createdOn',
    name: i18n.t('volunteers:department_and_role'),
    sortable: true,
    grow: 1,
    minWidth: '5rem',
    selector: (row: IAction) => formatDateWithTime(row.createdOn),
  },
];

const ActionsArchive = () => {
  const [page, setPage] = useState<number>();
  const [rowsPerPage, setRowsPerPage] = useState<number>();
  const [orderByColumn, setOrderByColumn] = useState<string>();
  const [orderDirection, setOrderDirection] = useState<OrderDirection>();

  const {
    data: actions,
    isLoading: isActionsLoading,
    error: actionsError,
  } = useActionsQuery({ orderBy: orderByColumn, orderDirection });

  useEffect(() => {
    if (actionsError)
      useErrorToast(InternalErrors.ACTIONS_ERRORS.getError(actionsError.response?.data.code_error));
  }, [actionsError]);

  const onSort = (column: TableColumn<IAction>, direction: SortOrder) => {
    setOrderByColumn(column.id as string);
    setOrderDirection(
      direction.toLocaleUpperCase() === OrderDirection.ASC
        ? OrderDirection.ASC
        : OrderDirection.DESC,
    );
  };

  return (
    <PageLayout>
      <PageHeader>{i18n.t('side_menu:options.actions_archive')}</PageHeader>
      <Card>
        <CardHeader>
          <h2>{i18n.t(`actions_archive:card_title`)}</h2>
        </CardHeader>
        <CardBody>
          <DataTableComponent
            columns={TableHeader}
            data={actions?.items}
            loading={isActionsLoading}
            pagination
            paginationPerPage={rowsPerPage}
            paginationTotalRows={actions?.meta?.totalItems}
            paginationDefaultPage={page}
            onChangeRowsPerPage={setRowsPerPage}
            onChangePage={setPage}
            onSort={onSort}
          />
        </CardBody>
      </Card>
    </PageLayout>
  );
};

export default ActionsArchive;
