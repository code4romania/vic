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
// the rest drop their desktop minimum widths so status and the "⋮" menu stay on screen.
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
    () => (narrow ? columns.map((column) => ({ ...column, minWidth: undefined })) : columns),
    [narrow, columns],
  );

  return (
    <DataTable
      className={classNames(
        !loading && !error && data?.length ? 'border-cool-gray-200' : '',
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
          <EmptyContent description={i18n.t('general:empty_table')} />
        )
      }
      progressComponent={<LoadingContent />}
      defaultSortFieldId={defaultSortFieldId}
      defaultSortAsc={defaultSortAsc}
    />
  );
};

export default DataTableComponent;
