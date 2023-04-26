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
import DataTableFilters from '../components/DataTableFilters';
import DateRangePicker from '../components/DateRangePicker';
import AdminSelect from '../containers/AdminSelect';
import { ListItem } from '../common/interfaces/list-item.interface';
import CellLayout from '../layouts/CellLayout';
import { mapEventDataToActionDescription } from '../common/utils/actions-archive.mappings';
import { ActionsArchiveProps } from '../containers/query/ActionsArchiveWithQueryParams';

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
    minWidth: '10rem',
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
    minWidth: '5rem',
    cell: (row: IAction) => <CellLayout>{formatDateWithTime(row.createdOn)}</CellLayout>,
  },
];

const ActionsArchive = ({ query, setQuery }: ActionsArchiveProps) => {
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

  const onActionDateRangeChange = ([actionStartDate, actionEndDate]: Date[]) => {
    setQuery({
      actionStartDate,
      actionEndDate,
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
    <PageLayout>
      <PageHeader>{i18n.t('side_menu:options.actions_archive')}</PageHeader>
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
          defaultValue={query.author ? { value: 'something dumb', label: query.author } : author}
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
    </PageLayout>
  );
};

export default ActionsArchive;
