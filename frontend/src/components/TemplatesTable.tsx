import React, { useEffect, useState } from 'react';
import Card from '../layouts/CardLayout';
import CardHeader from './CardHeader';
import i18n from '../common/config/i18n';
import CardBody from './CardBody';
import Button from './Button';
import DataTableComponent from './DataTableComponent';
import { ITemplateListItem } from '../common/interfaces/template-list-item.interface';
import Popover from './Popover';
import { ArrowDownTrayIcon, PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { SortOrder, TableColumn } from 'react-data-table-component';
import { TemplatesTableProps } from '../containers/query/TemplatesTableWithQueryParams';
import {
  useDeleteTemplateMutation,
  useTemplatesQuery,
} from '../services/templates/templates.service';
import { OrderDirection } from '../common/enums/order-direction.enum';
import { useErrorToast, useSuccessToast } from '../hooks/useToast';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { useNavigate } from 'react-router-dom';
import ConfirmationModal from './ConfirmationModal';
import { useTranslation } from 'react-i18next';

const TemplatesTableHeader = [
  {
    id: 'name',
    name: i18n.t('documents:templates.table.header.name'),
    sortable: true,
    grow: 5,
    selector: (row: ITemplateListItem) => row.name,
  },
  {
    id: 'uses',
    name: i18n.t('documents:templates.table.header.uses'),
    selector: (row: ITemplateListItem) => row.templateUses,
  },
];

const TemplatesTable = ({ query, setQuery }: TemplatesTableProps) => {
  const [showDeleteTemplate, setShowDeleteTemplate] = useState<null | ITemplateListItem>(null);

  const navigate = useNavigate();
  const { t } = useTranslation('documents');

  const { mutateAsync: deleteTemplate, isLoading: isDeletingTemplate } =
    useDeleteTemplateMutation();

  const {
    data: templates,
    isLoading,
    error,
    refetch,
  } = useTemplatesQuery({
    limit: query?.limit as number,
    page: query?.page as number,
    orderBy: query?.orderBy as string,
    orderDirection: query?.orderDirection as OrderDirection,
  });

  const onAddTemplate = () => {
    navigate('add-template');
  };

  const onDownloadAll = () => {
    alert('not yet implemented');
  };

  const onEdit = (row: ITemplateListItem) => {
    navigate(`${row.id}/edit`);
  };

  const onRemove = (row: ITemplateListItem) => {
    setShowDeleteTemplate(row);
  };

  const onDownloadTemplate = () => {
    alert('not yet implemented');
  };

  const confirmDelete = () => {
    if (showDeleteTemplate) {
      const templateId = showDeleteTemplate.id;
      setShowDeleteTemplate(null);
      deleteTemplate(templateId, {
        onSuccess: () => {
          useSuccessToast(t('templates.actions.delete.success'));
          refetch();
        },
        onError: (error) => {
          InternalErrors.TEMPLATE_ERRORS.getError(error.response?.data.code_error);
        },
        onSettled: () => {
          setShowDeleteTemplate(null);
        },
      });
    }
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
        <h2>{t('general:templates')}</h2>
        <div className="flex gap-2 lg:gap-6">
          <Button
            label={t('general:download_table')}
            className="btn-outline-secondary"
            icon={<ArrowDownTrayIcon className="h-5 w-5" />}
            onClick={onDownloadAll}
          />
          <Button
            label={t('templates.actions.add')}
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
          loading={isLoading || isDeletingTemplate}
          pagination
          paginationPerPage={query.limit}
          paginationTotalRows={templates?.meta?.totalItems}
          paginationDefaultPage={query.page}
          onChangeRowsPerPage={onRowsPerPageChange}
          onChangePage={onChangePage}
          onSort={onSort}
        />
      </CardBody>
      {showDeleteTemplate && (
        <ConfirmationModal
          title={t('templates.actions.delete.modal.title')}
          description={t('templates.actions.delete.modal.content')}
          confirmBtnLabel={t('templates.actions.delete.modal.action')}
          onClose={setShowDeleteTemplate.bind(null, null)}
          onConfirm={confirmDelete}
          confirmBtnClassName="btn-danger"
        />
      )}
    </Card>
  );
};

export default TemplatesTable;
