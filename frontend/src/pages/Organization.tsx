import React, { useEffect, useState } from 'react';
import { OrderDirection } from '../common/enums/order-direction.enum';
import OrganizationProfile from '../components/OrganizationProfile';
import Divisions, { DivisionsTabs, DivisionType, IDivision } from '../components/Divisions';
import { useErrorToast } from '../hooks/useToast';
import PageLayout from '../layouts/PageLayout';
import { SortOrder, TableColumn } from 'react-data-table-component';
import { useDivisionsQuery } from '../services/division/division.service';
import { useOrganizationProfileQuery } from '../services/organization-profile/organizationProfile.service';
import { InternalErrors } from '../common/errors/internal-errors.class';

const Organization = () => {
  const [divisionType, setDivisionType] = useState<DivisionType>(DivisionType.Branches);
  const [page, setPage] = useState<number>();
  const [rowsPerPage, setRowsPerPage] = useState<number>();
  const [orderByColumn, setOrderByColumn] = useState<string>();
  const [orderDirection, setOrderDirection] = useState<OrderDirection>();

  const { data: organization, error: organizationProfileError } = useOrganizationProfileQuery();

  const {
    data: division,
    isLoading: isFetchingDivision,
    error: divisionError,
  } = useDivisionsQuery(
    rowsPerPage as number,
    page as number,
    divisionType,
    orderByColumn,
    orderDirection,
  );

  useEffect(() => {
    if (division?.meta) {
      setPage(division.meta.currentPage);
      setRowsPerPage(division.meta.itemsPerPage);
      setOrderByColumn(division.meta.orderByColumn);
      setOrderDirection(division.meta.orderDirection);
    }
  }, []);

  // error handling
  useEffect(() => {
    // map error messages for DIVISIONS fetch
    if (divisionError) {
      useErrorToast(
        InternalErrors.DIVISION_ERRORS.getError(divisionError.response?.data.code_error),
      );
    }

    // map error messages for ORGANIZATION fetch
    if (organizationProfileError) {
      useErrorToast(
        InternalErrors.ORGANIZATION_ERRORS.getError(
          organizationProfileError.response?.data.code_error,
        ),
      );
    }
  }, [divisionError, organizationProfileError]);

  const onTabClick = (id: number) => {
    setDivisionType(DivisionsTabs.find((tab) => tab.key === id)?.value as DivisionType);
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

  return (
    <PageLayout>
      {organization && <OrganizationProfile organization={organization} />}
      {/* TODO: here we should add an ErrorContent in case don't have any values for organization */}
      {/* TODO: here we should add an Loading container to shwo while the organization is loading */}
      <Divisions
        isLoading={isFetchingDivision}
        divisionType={divisionType}
        data={division}
        onTabChange={onTabClick}
        onSort={onSort}
        page={page}
        onChangePage={onChangePage}
        onRowsPerPageChange={onRowsPerPageChange}
      />
    </PageLayout>
  );
};

export default Organization;
