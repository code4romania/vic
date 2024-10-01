import React, { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import CardBody from './CardBody';
import DataTableComponent from './DataTableComponent';
import Card from '../layouts/CardLayout';
import CardHeader from './CardHeader';
import { IDocumentTemplateListItem } from '../common/interfaces/template.interface';
import { useDocumentTemplatesQuery } from '../services/documents-templates/documents-templates.service';
import { OrderDirection } from '../common/enums/order-direction.enum';
import { format } from 'date-fns';
import { DocumentTemplatesSelectableProps } from '../containers/query/DocumentTemplatesTableSelectableWithQueryParams';
import { SortOrder, TableColumn } from 'react-data-table-component';


const DocumentTemplatesTableHeader = [
  {
    id: 'name',
    name: 'Nume',
    sortable: true,
    grow: 4,
    minWidth: '9rem',
    selector: (row: IDocumentTemplateListItem) => row.name,
  },
  {
    id: 'uses',
    name: 'Utilizări',
    sortable: true,
    grow: 1,
    minWidth: '5rem',
    selector: (row: IDocumentTemplateListItem) => row.usageCount,
  },
  {
    id: 'last_used',
    name: 'Ultima utilizare',
    sortable: true,
    grow: 1,
    minWidth: '5rem',
    selector: (row: IDocumentTemplateListItem) =>
      row.lastUsage ? format(row.lastUsage, 'dd/MM/yyyy') : '-',
  },
  {
    id: 'created_by',
    name: 'Creat de',
    sortable: true,
    grow: 1,
    minWidth: '5rem',
    selector: (row: IDocumentTemplateListItem) => row.createdByName,
  },
  {
    id: 'created_at',
    name: 'Data creării',
    sortable: true,
    grow: 1,
    minWidth: '5rem',
    selector: (row: IDocumentTemplateListItem) => format(row.createdOn, 'dd/MM/yyyy'),
  },
];

export const DocumentTemplateTableSelectable = ({
  query,
  setQuery,
  selectedTemplate,
  onSelectTemplate,
}: DocumentTemplatesSelectableProps) => {
  const { t } = useTranslation(['volunteering_contracts', 'stepper']);
  const firstRender = useRef(true);

  useEffect(() => {
    firstRender.current = false;
  }, []);

  const { data: templates, isLoading: isLoadingDocumentTemplates } = useDocumentTemplatesQuery({
    limit: 10,
    page: 1,
    orderBy: 'name',
    orderDirection: OrderDirection.ASC,
  });

  const handleOnSelectTemplate = (templates: IDocumentTemplateListItem[]) => {
    if (templates.length === 0) {
      onSelectTemplate(templates[0]);
    } else if (templates[0].id !== selectedTemplate?.id) {
      onSelectTemplate(templates[0]);
    }
  };

  const defaultSelectedRows = useCallback(
    (row: IDocumentTemplateListItem) => {
      return row.id === selectedTemplate?.id;
    },
    [selectedTemplate],
  );

  // We're doing this because of a bug in DataTableComponent
  // https://github.com/jbetancur/react-data-table-component/issues/930
  // https://github.com/jbetancur/react-data-table-component/issues/955

  // While some fixes exist we should be able to also unselect the row, thus removing props after the first render is the only way that works.
  const selectProps = {
    ...(firstRender.current && {
      selectableRowSelected: defaultSelectedRows,
    }),
    ...(!firstRender.current && {
      onSelectedRowsChange: handleOnSelectTemplate,
    }),
  };

  // pagination
  const onRowsPerPageChange = (limit: number) => {
    setQuery(
      {
        limit,
        page: 1,
      },
      'replaceIn',
    );
  };

  const onChangePage = (page: number) => {
    setQuery(
      {
        page,
      },
      'replaceIn',
    );
  };

  const onSort = (column: TableColumn<IDocumentTemplateListItem>, direction: SortOrder) => {
    setQuery(
      {
        orderBy: column.id as string,
        orderDirection:
          direction.toLocaleUpperCase() === OrderDirection.ASC
            ? OrderDirection.ASC
            : OrderDirection.DESC,
      },
      'replaceIn',
    );
  };

  return (
    <Card>
      <CardHeader>
        <h2>{t('templates')}</h2>
      </CardHeader>
      <CardBody>
        <DataTableComponent
          {...selectProps}
          columns={[...DocumentTemplatesTableHeader]}
          data={templates?.items}
          loading={isLoadingDocumentTemplates}
          pagination
          paginationPerPage={10}
          selectableRows
          selectableRowsSingle
          selectableRowsComponentProps={{ type: 'radio' }}
          paginationTotalRows={templates?.items?.length}
          paginationDefaultPage={query.page as number}
          onChangeRowsPerPage={onRowsPerPageChange}
          onChangePage={onChangePage}
          onSort={onSort}
        />
      </CardBody>
    </Card>
  );
};
