import React, { useEffect, useState } from 'react';
import DataTableFilters from './DataTableFilters';
import DateRangePicker from './DateRangePicker';
import AdminSelect from '../containers/AdminSelect';
import Card from '../layouts/CardLayout';
import CardHeader from './CardHeader';
import CardBody from './CardBody';
import DataTableComponent from './DataTableComponent';
import i18n from '../common/config/i18n';
import { ListItem } from '../common/interfaces/list-item.interface';
import { useActionsQuery } from '../services/actions/actions.service';
import { SortOrder, TableColumn } from 'react-data-table-component';
import { IAction } from '../common/interfaces/action.interface';
import { OrderDirection } from '../common/enums/order-direction.enum';
import { useErrorToast } from '../hooks/useToast';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { ActionsArchiveProps } from '../containers/query/ActionsArchiveWithQueryParams';
import CellLayout from '../layouts/CellLayout';
import { mapEventDataToActionDescription } from '../common/utils/actions-archive.mappings';
import { formatDateWithTime } from '../common/utils/utils';

const TableHeader = [
  {
    id: 'eventName',
    name: i18n.t('actions_archive:area'),
    sortable: true,
    grow: 2,
    minWidth: '10rem',
    selector: (row: IAction) => i18n.t(`actions_archive:${row.eventName}.label`),
  },

  {
    id: 'author.name',
    name: i18n.t('actions_archive:author'),
    sortable: true,
    grow: 1,
    minWidth: '5rem',
    selector: (row: IAction) => row.author.name,
  },
  {
    id: 'eventData',
    name: i18n.t('general:description'),
    sortable: false,
    grow: 2,
    minWidth: '15rem',
    cell: (row: IAction) => (
      <CellLayout>
        <div className="max-h-32">
          {mapEventDataToActionDescription(row.eventName, row.eventData, row.changes)}
        </div>
      </CellLayout>
    ),
  },
  {
    id: 'createdOn',
    name: i18n.t('general:date'),
    sortable: true,
    grow: 1,
    minWidth: '10rem',
    cell: (row: IAction) => <CellLayout>{formatDateWithTime(row.createdOn)}</CellLayout>,
  },
];

type ActionsArchiveTableProps = ActionsArchiveProps;

const ActionsArchiveTable = ({ query, setQuery, volunteerId }: ActionsArchiveTableProps) => {
  // filters
  const [author, setAuthor] = useState<ListItem>();

  const {
    data: actions,
    isLoading: isActionsLoading,
    error: actionsError,
  } = useActionsQuery({
    orderBy: query?.orderBy,
    orderDirection: query.orderDirection as OrderDirection,
    page: query.page as number,
    limit: query.limit as number,
    search: query.search,
    actionStartDate: query.actionStartDate,
    actionEndDate: query.actionEndDate,
    author: query.author,
    volunteerId,
  });

  useEffect(() => {
    if (actionsError)
      useErrorToast(InternalErrors.ACTIONS_ERRORS.getError(actionsError.response?.data.code_error));
  }, [actionsError]);

  const onSort = (column: TableColumn<IAction>, direction: SortOrder) => {
    setQuery({
      orderBy: column.id as string,
      orderDirection:
        direction.toLocaleUpperCase() === OrderDirection.ASC
          ? OrderDirection.ASC
          : OrderDirection.DESC,
    });
  };

  const onChangePage = (page: number) => {
    setQuery({
      page,
    });
  };

  const onRowsPerPageChange = (limit: number) => {
    setQuery({
      limit,
      page: 1,
    });
  };

  const onSearch = (search: string) => {
    setQuery({
      search,
    });
  };

  const onActionDateRangeChange = ([actionStartDate, actionEndDate]: [
    Date | null,
    Date | null,
  ]) => {
    setQuery({
      actionStartDate: actionStartDate ?? undefined,
      actionEndDate: actionEndDate ?? undefined,
    });
  };

  const onAuthorChange = (admin: ListItem) => {
    setAuthor(admin);
    setQuery({ author: admin.label });
  };

  const onResetFilters = () => {
    setAuthor(undefined);
    setQuery({}, 'push');
  };

  return (
    <>
      <DataTableFilters
        onSearch={onSearch}
        searchValue={query?.search}
        onResetFilters={onResetFilters}
      >
        <DateRangePicker
          label={i18n.t('actions_archive:filters.execution')}
          onChange={onActionDateRangeChange}
          value={
            query?.actionStartDate && query?.actionEndDate
              ? [query?.actionStartDate, query?.actionEndDate]
              : undefined
          }
          id="execution-on-range__picker"
        />
        <AdminSelect
          label={i18n.t('actions_archive:author')}
          onSelect={onAuthorChange}
          defaultValue={query.author ? { value: '', label: query.author } : author}
        />
      </DataTableFilters>
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
            paginationPerPage={query.limit}
            paginationTotalRows={actions?.meta?.totalItems}
            paginationDefaultPage={query.page}
            onChangeRowsPerPage={onRowsPerPageChange}
            onChangePage={onChangePage}
            onSort={onSort}
          />
        </CardBody>
      </Card>
    </>
  );
};

export default ActionsArchiveTable;
