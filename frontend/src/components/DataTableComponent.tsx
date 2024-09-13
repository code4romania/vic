import React from 'react';
import DataTable, { SortOrder, TableColumn } from 'react-data-table-component';
import { classNames } from '../common/utils/utils';
import i18n from '../common/config/i18n';
import EmptyContent from './EmptyContent';
import LoadingContent from './LoadingContent';
import { ChevronUpDownIcon } from '@heroicons/react/24/outline';
import { PaginationConfig } from '../common/constants/pagination';

interface DataTableProps<T> {
  columns: TableColumn<T>[];
  data?: T[];
  loading?: boolean;
  pagination?: boolean;
  sortServer?: boolean;
  paginationPerPage?: number;
  paginationTotalRows?: number;
  paginationDefaultPage?: number;
  onChangePage?: (page: number) => void;
  onChangeRowsPerPage?: (rowsPerPage: number) => void;
  selectableRows?: boolean;
  selectableRowsSingle?: boolean;
  onSelectedRowsChange?: (selectedRows: T[]) => void;
  selectableRowSelected?: (row: T) => boolean;
  selectableRowDisabled?: (row: T) => boolean;
  onSort?: (selectedColumn: TableColumn<T>, sortDirection: SortOrder, sortedRows: T[]) => void;
  defaultSortFieldId?: string | number;
  defaultSortAsc?: boolean;

}

const DataTableComponent = <T extends object>({
  columns,
  data,
  loading,
  pagination,
  sortServer,
  paginationPerPage,
  paginationTotalRows,
  paginationDefaultPage,
  onSort,
  onChangePage,
  onChangeRowsPerPage,
  selectableRows,
  selectableRowsSingle,
  onSelectedRowsChange,
  selectableRowSelected,
  selectableRowDisabled,
  defaultSortFieldId,
  defaultSortAsc,
}: DataTableProps<T>) => {
  return (
    <DataTable
      className={classNames(
        !loading && data?.length ? 'border-cool-gray-200' : '',
        `rdt_TableWrapper`,
      )}
      noHeader
      columns={columns}
      data={data || []}
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
      noDataComponent={<EmptyContent description={i18n.t('general:empty_table')} />}
      progressComponent={<LoadingContent />}
      defaultSortFieldId={defaultSortFieldId}
      defaultSortAsc={defaultSortAsc}
      selectableRows={selectableRows}
      selectableRowsSingle={selectableRowsSingle}
      selectableRowSelected={selectableRowSelected}
      selectableRowDisabled={selectableRowDisabled}
      onSelectedRowsChange={(selected) =>
        onSelectedRowsChange && onSelectedRowsChange(selected.selectedRows)
      }
    />
  );
};

export default DataTableComponent;
