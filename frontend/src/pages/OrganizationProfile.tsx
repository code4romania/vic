import React, { useEffect, useState } from 'react';
import { OrderDirection } from '../common/enums/sort-direction.enum';
import { IPaginatedEntity } from '../common/interfaces/paginated-entity.interface';
import Divisions, { DivisionTabs, DivisionType, IDivision } from '../components/Division';
import { useErrorToast } from '../hooks/useToast';
import PageLayout from '../layouts/PageLayout';
import { useDivisionDataQuery } from '../services/test/test.service';
import i18n from '../common/config/i18n';
import { SortOrder, TableColumn } from 'react-data-table-component';

const OrganizationProfile = () => {
  const [divisionType, setDivisionType] = useState<DivisionType>(DivisionType.Branch);
  const [data, setData] = useState<IPaginatedEntity<IDivision>>();
  const [page, setPage] = useState<number>();
  const [rowsPerPage, setRowsPerPage] = useState<number>();
  const [orderByColumn, setOrderByColumn] = useState<string>();
  const [orderDirection, setOrderDirection] = useState<OrderDirection>();

  const {
    data: divisionData,
    isLoading,
    error,
  } = useDivisionDataQuery(
    rowsPerPage as number,
    page as number,
    orderByColumn as string,
    orderDirection as OrderDirection,
    divisionType as DivisionType,
  );

  useEffect(() => {
    if (divisionData?.meta) {
      setPage(divisionData.meta.currentPage);
      setRowsPerPage(divisionData.meta.itemsPerPage);
      setOrderByColumn(divisionData.meta.orderByColumn);
      setOrderDirection(divisionData.meta.orderDirection);
    }
  }, []);

  useEffect(() => {
    if (error) useErrorToast(i18n.t('general:load_error'));
  }, [error]);

  const handleTabClick = (id: number) => {
    setDivisionType(DivisionTabs.find((tab) => tab.key === id)?.value as DivisionType);
    setData(divisionData);
  };

  // pagination
  const onRowsPerPageChange = (rows: number) => {
    setRowsPerPage(rows);
  };

  const onChangePage = (newPage: number) => {
    setPage(newPage);
  };

  const onSort = (column: TableColumn<IDivision>, direction: SortOrder) => {
    console.log(column);
    setOrderByColumn(column.id as string);
    setOrderDirection(
      direction.toLocaleUpperCase() === OrderDirection.ASC
        ? OrderDirection.ASC
        : OrderDirection.DESC,
    );
  };

  return (
    <PageLayout>
      <Divisions
        isLoading={isLoading}
        divisionType={divisionType as DivisionType}
        data={data}
        onTabChange={handleTabClick}
        onSort={onSort}
        page={page as number}
        onChangePage={onChangePage}
        onRowsPerPageChange={onRowsPerPageChange}
      />
    </PageLayout>
  );
};

export default OrganizationProfile;
