import React, { useEffect } from 'react';
import Card from '../layouts/CardLayout';
import CardHeader from './CardHeader';
import i18n from '../common/config/i18n';
import CardBody from './CardBody';
import Button from './Button';
import DataTableComponent from './DataTableComponent';
import { ITemplateListItem } from '../common/interfaces/template.interface';
import Popover from './Popover';
import { ArrowDownTrayIcon, PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { SortOrder, TableColumn } from 'react-data-table-component';
import { TemplatesTableProps } from '../containers/query/TemplatesTableWithQueryParams';
import { useTemplatesQuery } from '../services/templates/templates.service';
import { OrderDirection } from '../common/enums/order-direction.enum';
import { useErrorToast } from '../hooks/useToast';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { useNavigate } from 'react-router-dom';

const TemplatesTableHeader = [
  {
    id: 'name',
    name: i18n.t('documents:name'),
    sortable: true,
    grow: 5,
    selector: (row: ITemplateListItem) => row.name,
  },
  {
    id: 'uses',
    name: i18n.t('general:uses'),
    sortable: true,
    selector: (row: ITemplateListItem) => row.uses,
  },
];

const TemplatesTable = ({ query, setQuery }: TemplatesTableProps) => {
  const navigate = useNavigate();

  const {
    data: templates,
    isLoading,
    error,
  } = useTemplatesQuery({
    limit: query?.limit as number,
    page: query?.page as number,
    orderBy: query?.orderBy as string,
    orderDirection: query?.orderDirection as OrderDirection,
  });

  const onAddTemplate = () => {
    navigate('add');
  };

  const onDownloadAll = () => {
    alert('not yet implemented');
  };

  const onEdit = (row: ITemplateListItem) => {
    navigate(`${row.id}/edit`);
  };

  const onRemove = () => {
    alert('not yet implemented');
  };

  const onDownloadTemplate = () => {
    alert('not yet implemented');
  };

  const buildTemplateActionColumn = (): TableColumn<ITemplateListItem> => {
    const templateMenuItems = [
      {
        label: i18n.t('documents:popover.edit'),
        icon: <PencilIcon className="menu-icon" />,
        onClick: onEdit,
      },
      {
        label: i18n.t('documents:popover.download'),
        icon: <ArrowDownTrayIcon className="menu-icon" />,
        onClick: onDownloadTemplate,
      },
      {
        label: i18n.t('documents:popover.remove'),
        icon: <TrashIcon className="menu-icon" />,
        onClick: onRemove,
        alert: true,
      },
    ];

    return {
      name: '',
      cell: (row: ITemplateListItem) => (
        <Popover<ITemplateListItem> row={row} items={templateMenuItems} />
      ),
      width: '50px',
      allowOverflow: true,
    };
  };

  // pagination
  const onRowsPerPageChange = (rows: number) => {
    setQuery({
      limit: rows,
      page: 1,
    });
  };

  const onChangePage = (newPage: number) => {
    setQuery({
      page: newPage,
    });
  };

  const onSort = (column: TableColumn<ITemplateListItem>, direction: SortOrder) => {
    setQuery({
      orderBy: column.id as string,
      orderDirection:
        direction.toLocaleUpperCase() === OrderDirection.ASC
          ? OrderDirection.ASC
          : OrderDirection.DESC,
    });
  };

  // query error handling
  useEffect(() => {
    if (error)
      useErrorToast(InternalErrors.TEMPLATE_ERRORS.getError(error.response?.data.code_error));
  }, [error]);

  return (
    <Card>
      <CardHeader>
        <h2>{i18n.t('general:templates')}</h2>
        <div className="flex gap-2 lg:gap-6">
          <Button
            label={i18n.t('documents:download_all')}
            className="btn-outline-secondary"
            icon={<ArrowDownTrayIcon className="h-5 w-5" />}
            onClick={onDownloadAll}
          />
          <Button
            label={i18n.t('documents:add_template')}
            className="btn-primary"
            icon={<PlusIcon className="h-5 w-5" />}
            onClick={onAddTemplate}
          />
        </div>
      </CardHeader>
      <CardBody>
        <DataTableComponent
          columns={[...TemplatesTableHeader, buildTemplateActionColumn()]}
          data={templates?.items}
          loading={isLoading}
          pagination
          paginationPerPage={query.limit}
          paginationTotalRows={templates?.meta?.totalItems}
          paginationDefaultPage={query.page}
          onChangeRowsPerPage={onRowsPerPageChange}
          onChangePage={onChangePage}
          onSort={onSort}
        />
      </CardBody>
    </Card>
  );
};

export default TemplatesTable;
