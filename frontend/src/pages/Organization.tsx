import React, { useEffect, useState } from 'react';
import { OrderDirection } from '../common/enums/order-direction.enum';
import OrganizationProfile from '../components/OrganizationProfile';
import Divisions, { DivisionsTabs, DivisionType, IDivision } from '../components/Divisions';
import { useErrorToast } from '../hooks/useToast';
import PageLayout from '../layouts/PageLayout';
import { SortOrder, TableColumn } from 'react-data-table-component';
import { useDivisionsQuery } from '../services/division/division.service';
import { useOrganizationQuery } from '../services/organization/organization.service';
import { InternalErrors } from '../common/errors/internal-errors.class';
import i18n from '../common/config/i18n';
import EmptyContent from '../components/EmptyContent';
import LoadingContent from '../components/LoadingContent';

const Organization = () => {
  const [divisionType, setDivisionType] = useState<DivisionType>(DivisionType.Branches);
  const [page, setPage] = useState<number>();
  const [rowsPerPage, setRowsPerPage] = useState<number>();
  const [orderByColumn, setOrderByColumn] = useState<string>();
  const [orderDirection, setOrderDirection] = useState<OrderDirection>();

  const {
    data: organization,
    error: organizationError,
    isLoading: isOrganizationLoading,
  } = useOrganizationQuery();

  const {
    data: division,
    isLoading: isFetchingDivision,
    error: divisionError,
    refetch,
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
        'divisions_error',
      );
    }

    // map error messages for ORGANIZATION fetch
    if (organizationError) {
      useErrorToast(
        InternalErrors.ORGANIZATION_ERRORS.getError(organizationError.response?.data.code_error),
        'organization_error',
      );
    }
  }, [divisionError, organizationError]);

  const onTabClick = (id: DivisionType) => {
    setDivisionType(DivisionsTabs.find((tab) => tab.key === id)?.key as DivisionType);
  };

  const onRefetch = () => {
    refetch();
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
      <h1>{i18n.t('side_menu:options.organization')}</h1>
      {organization && <OrganizationProfile organization={organization} />}
      {organizationError && (
        <EmptyContent
          description={InternalErrors.ORGANIZATION_ERRORS.getError(
            organizationError.response?.data.code_error,
          )}
        />
      )}
      {isOrganizationLoading && <LoadingContent />}
      <Divisions
        isLoading={isFetchingDivision}
        divisionType={divisionType}
        data={division}
        onTabChange={onTabClick}
        onSort={onSort}
        page={page}
        onChangePage={onChangePage}
        onRowsPerPageChange={onRowsPerPageChange}
        onRefetch={onRefetch}
      />
    </PageLayout>
  );
};

export default Organization;
