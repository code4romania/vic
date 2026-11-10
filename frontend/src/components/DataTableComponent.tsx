import React, { useEffect, useMemo, useState } from 'react';
import DataTable, { SortOrder, TableColumn } from 'react-data-table-component';
import { classNames } from '../common/utils/utils';
import i18n from '../common/config/i18n';
import EmptyContent from './EmptyContent';
import LoadingContent from './LoadingContent';
import LoadErrorContent from './LoadErrorContent';
import { ChevronUpDownIcon } from '@heroicons/react/24/outline';
import { PaginationConfig } from '../common/constants/pagination';

// Phones (the table library's "sm" breakpoint): the columns marked hide: Media.SM are gone, and
// the rest drop their desktop minimum widths so status and the "⋮" menu stay on screen. A column
// that does not grow (status, hours) takes only the width of its content.
const NARROW = '(max-width: 599px)';

const useNarrowScreen = (): boolean => {
  const query = typeof window !== 'undefined' && window.matchMedia?.(NARROW);
  const [narrow, setNarrow] = useState<boolean>(!!query && query.matches);
  useEffect(() => {
    if (!query) return;
    const onChange = (event: MediaQueryListEvent) => setNarrow(event.matches);
    query.addEventListener?.('change', onChange);
    return () => query.removeEventListener?.('change', onChange);
  }, []);
  return narrow;
};

interface DataTableProps<T> {
  columns: TableColumn<T>[];
  data?: T[];
  loading?: boolean;
  // The request failed: show the error and a retry button instead of "no data"
  error?: unknown;
  onRetry?: () => void;
  // What an empty list says, and what to do next ("Adaugă primul voluntar"); generic otherwise
  empty?: { title?: string; description: string; action?: React.ReactNode };
  pagination?: boolean;
  sortServer?: boolean;
  paginationPerPage?: number;
  paginationTotalRows?: number;
  paginationDefaultPage?: number;
  onChangePage?: (page: number) => void;
  onChangeRowsPerPage?: (rowsPerPage: number) => void;
  onSort?: (selectedColumn: TableColumn<T>, sortDirection: SortOrder, sortedRows: T[]) => void;
  defaultSortFieldId?: string | number;
  defaultSortAsc?: boolean;
}

const DataTableComponent = <T extends object>({
  columns,
  data,
  loading,
  error,
  onRetry,
  empty,
  pagination,
  sortServer,
  paginationPerPage,
  paginationTotalRows,
  paginationDefaultPage,
  onSort,
  onChangePage,
  onChangeRowsPerPage,
  defaultSortFieldId,
  defaultSortAsc,
}: DataTableProps<T>) => {
  const narrow = useNarrowScreen();
  const responsiveColumns = useMemo(
    () =>
      narrow
        ? // a column with a button (allowOverflow) keeps its width, so the button is not cut
          columns.map((column) => {
            if (column.allowOverflow || column.width) return column;
            return { ...column, minWidth: column.grow === 0 ? 'fit-content' : '0' };
          })
        : columns,
    [narrow, columns],
  );

  return (
    <DataTable
      className={classNames(
        !loading && !error && data?.length ? 'border-cool-gray-200' : '',
        narrow && columns.some((column) => column.hide) ? 'rdt-fit' : '',
        // the last column holds the row actions: it stays visible while the table scrolls sideways
        columns[columns.length - 1]?.allowOverflow ? 'rdt-sticky-actions' : '',
        `rdt_TableWrapper`,
      )}
      noHeader
      columns={responsiveColumns}
      data={error ? [] : data || []}
      progressPending={loading}
      pagination={pagination}
      paginationServer={pagination}
      paginationComponentOptions={{
        rowsPerPageText: (i18n.t('pagination:rows_per_page') as string) || '',
        rangeSeparatorText: (i18n.t('pagination:range_separator_text') as string) || '',
      }}
      paginationDefaultPage={paginationDefaultPage}
      responsive
      sortIcon={<ChevronUpDownIcon />}
      sortServer={sortServer}
      onSort={onSort}
      paginationTotalRows={paginationTotalRows}
      paginationPerPage={paginationPerPage}
      paginationRowsPerPageOptions={PaginationConfig.rowsPerPageOptions}
      onChangePage={onChangePage}
      onChangeRowsPerPage={onChangeRowsPerPage}
      noDataComponent={
        error ? (
          <LoadErrorContent onRetry={onRetry} />
        ) : (
          <EmptyContent
            title={empty?.title}
            description={empty?.description ?? i18n.t('general:empty_table')}
            action={empty?.action}
          />
        )
      }
      progressComponent={<LoadingContent />}
      defaultSortFieldId={defaultSortFieldId}
      defaultSortAsc={defaultSortAsc}
    />
  );
};

export default DataTableComponent;
