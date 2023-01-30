import React from 'react';
import DataTable, { SortOrder, TableColumn } from 'react-data-table-component';

interface DataTableProps<T> {
  className: string;
  columns: TableColumn<T>[];
  data: T[];
  rowsPerPageText?: string;
  rangeSeparatorText?: string;
  EmptyContent?: JSX.Element;
  LoadingContent?: JSX.Element;
  sortIcon?: JSX.Element;
  loading?: boolean;
  pagination?: boolean;
  sortServer?: boolean;
  paginationPerPage?: number;
  paginationRowsPerPageOptions?: number[];
  paginationTotalRows?: number;
  paginationDefaultPage?: number;
  onChangePage?: (page: number) => void;
  onChangeRowsPerPage?: (rowsPerPage: number) => void;
  onSort?: (selectedColumn: TableColumn<T>, sortDirection: SortOrder, sortedRows: T[]) => void;
  defaultSortFieldId?: string | number;
  defaultSortAsc?: boolean;
}

const DataTableComponent = <T extends object>({
  className,
  columns,
  data,
  rowsPerPageText,
  rangeSeparatorText,
  EmptyContent,
  LoadingContent,
  sortIcon,
  loading,
  pagination,
  sortServer,
  paginationPerPage,
  paginationRowsPerPageOptions,
  paginationTotalRows,
  paginationDefaultPage,
  onSort,
  onChangePage,
  onChangeRowsPerPage,
  defaultSortFieldId,
  defaultSortAsc,
}: DataTableProps<T>) => {
  return (
    <div className={className}>
      <DataTable
        noHeader
        columns={columns}
        data={data}
        progressPending={loading}
        pagination={pagination}
        paginationServer={pagination}
        paginationComponentOptions={{
          rowsPerPageText,
          rangeSeparatorText,
        }}
        paginationDefaultPage={paginationDefaultPage}
        responsive
        sortIcon={sortIcon}
        sortServer={sortServer}
        onSort={onSort}
        paginationTotalRows={paginationTotalRows}
        paginationPerPage={paginationPerPage}
        paginationRowsPerPageOptions={paginationRowsPerPageOptions}
        onChangePage={onChangePage}
        onChangeRowsPerPage={onChangeRowsPerPage}
        noDataComponent={EmptyContent}
        progressComponent={LoadingContent}
        defaultSortFieldId={defaultSortFieldId}
        defaultSortAsc={defaultSortAsc}
      />
    </div>
  );
};

export default DataTableComponent;
