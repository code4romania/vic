import React from 'react';
import { useTranslation } from 'react-i18next';
import CardBody from './CardBody';
import DataTableComponent from './DataTableComponent';
import Card from '../layouts/CardLayout';
import CardHeader from './CardHeader';
import { IDocumentTemplateListItem } from '../common/interfaces/template.interface';
import { useDocumentTemplatesQuery } from '../services/documents-templates/documents-templates.service';
import { OrderDirection } from '../common/enums/order-direction.enum';
import { format } from 'date-fns';
import { SortOrder, TableColumn } from 'react-data-table-component';
import { DocumentTemplatesProps } from '../containers/query/DocumentTemplatesTableWithQueryParams';
import { ArrowDownTrayIcon, EyeIcon, PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import Popover from './Popover';
import { Link, useNavigate } from 'react-router-dom';
import Button from './Button';

const createArchiveRoute = (name: string) => `/actions-archive?author=${name.split(' ').join('+')}`;

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
		selector: (row: IDocumentTemplateListItem) => row.lastUsage ? format(row.lastUsage, 'dd/MM/yyyy') : '-',
	},
	{
		id: 'created_by',
		name: 'Creat de',
		sortable: true,
		grow: 1,
		minWidth: '5rem',
		cell: (row: IDocumentTemplateListItem) => (<Link className='text-yellow-600 hover:pointer' to={createArchiveRoute(row.createdByName)}>{row.createdByName}</Link>),
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


export const DocumentTemplatesTable = ({ query, setQuery }: DocumentTemplatesProps) => {
	const { t } = useTranslation(['doc_templates']);
	const navigate = useNavigate();

	const { data: templates, isLoading: isLoadingDocumentTemplates } = useDocumentTemplatesQuery({
		limit: 10,
		page: 1,
		orderBy: 'name',
		orderDirection: OrderDirection.ASC,
	});

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

	const buildDocumentTemplatesTableActions = (): TableColumn<IDocumentTemplateListItem> => {
		const menuItemsNotUsed = [
			{
				label: t('table.table_actions.view'),
				icon: <EyeIcon className="menu-icon" />,
				onClick: (row: IDocumentTemplateListItem) => { navigate(`${row.id}`) },
			},
			{
				label: t('table.table_actions.edit'),
				icon: <PencilIcon className="menu-icon" />,
				onClick: (row: IDocumentTemplateListItem) => { navigate(`${row.id}/edit`) },
			},
			{
				label: t('table.table_actions.download_uncompleted'),
				icon: <ArrowDownTrayIcon className="menu-icon" />,
				onClick: () => { },
			},
			{
				label: t('table.table_actions.delete'),
				icon: <TrashIcon className="menu-icon" />,
				onClick: () => { },
				alert: true,
			},
		];

		const menuItemsUsed = [
			{
				label: t('table.table_actions.view'),
				icon: <EyeIcon className="menu-icon" />,
				onClick: (row: IDocumentTemplateListItem) => { navigate(`${row.id}`) },
			},
			{
				label: t('table.table_actions.download_uncompleted'),
				icon: <ArrowDownTrayIcon className="menu-icon" />,
				onClick: () => { },
			},
		]

		return {
			name: '',
			cell: (row: IDocumentTemplateListItem) => <Popover<IDocumentTemplateListItem> row={row} items={+row.usageCount > 0 ? menuItemsUsed : menuItemsNotUsed} />,
			width: '50px',
			allowOverflow: true,
		};
	};

	return (
		<Card>
			<CardHeader>
				<h2>{t('table.title')}</h2>
				<div className="flex gap-2 lg:gap-6">
					<Button
						label={t('table.table_header.download_all')}
						className="btn-outline-secondary"
						icon={<ArrowDownTrayIcon className="h-5 w-5" />}
						onClick={() => { }}
					/>
					<Button
						label={t('table.table_header.create')}
						className="btn-primary"
						icon={<PlusIcon className="h-5 w-5" />}
						onClick={() => navigate('/documents/templates/create')}
					/>
				</div>
			</CardHeader>
			<CardBody>
				<DataTableComponent
					columns={[...DocumentTemplatesTableHeader, buildDocumentTemplatesTableActions()]}
					data={templates?.items}
					loading={isLoadingDocumentTemplates}
					pagination
					paginationPerPage={10}
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
