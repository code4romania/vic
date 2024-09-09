import React from 'react';
import { IPaginationQueryParams } from '../common/constants/pagination';
import { IHOCQueryProps } from '../common/interfaces/hoc-query-props.interface';
import Card from '../layouts/CardLayout';
import CardHeader from './CardHeader';
import Button from './Button';
import { useTranslation } from 'react-i18next';
import { ArrowDownTrayIcon, EyeIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import CardBody from './CardBody';
import DataTableComponent from './DataTableComponent';
import { ContractTemplate } from '../pages/ContractTemplates';
import { SortOrder, TableColumn } from 'react-data-table-component';
import Popover from './Popover';
import { OrderDirection } from '../common/enums/order-direction.enum';

export interface TemplatesTableQueryProps extends IPaginationQueryParams {
  name?: string;
  uses?: number;
  lastUseDate?: Date;
  createdBy?: string;
  createdAt?: Date;
}

export type TemplatesTableProps = IHOCQueryProps<TemplatesTableQueryProps>;

const ContractTemplatesTableHeader = [
  {
    id: 'name',
    name: 'Nume',
    sortable: true,
    grow: 4,
    minWidth: '9rem',
    selector: (row: ContractTemplate) => row.name,
  },
  {
    id: 'uses',
    name: 'Utilizări',
    sortable: true,
    grow: 1,
    minWidth: '5rem',
    // todo: get uses count
    selector: () => 'TODO',
  },
  {
    id: 'last_used',
    name: 'Ultima utilizare',
    sortable: true,
    grow: 1,
    minWidth: '5rem',
    // todo: get last usage count
    selector: () => 'TODO',
  },
  {
    id: 'created_by',
    name: 'Creat de',
    sortable: true,
    grow: 1,
    minWidth: '5rem',
    selector: (row: ContractTemplate) => row.createdByAdmin.name,
  },
  {
    id: 'created_at',
    name: 'Data creării',
    sortable: true,
    grow: 1,
    minWidth: '5rem',
    // todo: get created_at date
    selector: () => 'TODO',
  },
];

const NewTemplatesTable = ({ query, setQuery }: TemplatesTableProps) => {
  const { t } = useTranslation('volunteering_contracts');
  const navigate = useNavigate();

  //   todo: remove
  console.log(query);

  const templates: ContractTemplate[] = [
    {
      id: '9a827436-e0b8-4763-8b04-ccff3f9b2757',
      name: 'Test Template Lucia',
      organizationData: {
        CUI: '1278133',
        officialName: 'Tenebru Diamonds Industry',
        registeredOffice: 'Strada Cazarmii NR. 3392',
        legalRepresentativeName: 'John Dave',
        legalRepresentativeRole: 'Admin',
      },
      documentTerms: '<p>Contract terms</p>',
      createdByAdmin: {
        id: '8f2a561d-982f-465f-8dfb-bb2e16c39be6',
        name: 'Galdo Gerald',
      },
    },
    {
      id: 'b3c45678-d9e0-4f12-a3b4-56c7d8e9f012',
      name: 'Standard Contract Template',
      organizationData: {
        CUI: '9876543',
        officialName: 'Global Solutions Inc.',
        registeredOffice: 'Main Street 123',
        legalRepresentativeName: 'Jane Smith',
        legalRepresentativeRole: 'CEO',
      },
      documentTerms: '<p>Standard contract terms and conditions</p>',
      createdByAdmin: {
        id: '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p',
        name: 'Admin User',
      },
    },
    {
      id: 'c7d89012-e3f4-5g6h-i7j8-9k0l1m2n3o4p',
      name: 'Volunteer Agreement Template',
      organizationData: {
        CUI: '5432109',
        officialName: 'Community Helpers Association',
        registeredOffice: 'Volunteer Avenue 456',
        legalRepresentativeName: 'Mark Johnson',
        legalRepresentativeRole: 'Director',
      },
      documentTerms: '<p>Volunteer agreement terms</p>',
      createdByAdmin: {
        id: 'q1w2e3r4-t5y6-u7i8-o9p0-a1s2d3f4g5h6',
        name: 'Sarah Admin',
      },
    },
  ];

  const buildActiveVolunteersActionColumn = (): TableColumn<ContractTemplate> => {
    const contractTemplateMenuItems = [
      {
        label: 'Vizualizează',
        icon: <EyeIcon className="menu-icon" />,
        onClick: onView,
      },
    ];

    return {
      name: '',
      cell: (row: ContractTemplate) => (
        <Popover<ContractTemplate> row={row} items={contractTemplateMenuItems} />
      ),
      width: '50px',
      allowOverflow: true,
    };
  };

  const onView = (row: ContractTemplate) => {
    navigate(`/documents/templates/${row.id}`);
  };

  const onSort = (column: TableColumn<ContractTemplate>, direction: SortOrder) => {
    setQuery({
      orderBy: column.id as string,
      orderDirection:
        direction.toLocaleUpperCase() === OrderDirection.ASC
          ? OrderDirection.ASC
          : OrderDirection.DESC,
    });
  };

  const onChangePage = (newPage: number) => {
    setQuery({
      page: newPage,
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-row gap-4 justify-end items-center flex-1 last:">
          <h2 className="mr-auto">{t('table_header.title')}</h2>
          <Button
            label={t('table_header.download_all')}
            className="btn-outline-secondary"
            icon={<ArrowDownTrayIcon className="h-5 w-5" />}
          />
          <Button
            label={t('table_header.create_template')}
            className="btn-primary"
            icon={<PlusIcon className="h-5 w-5" />}
            onClick={() => navigate('/documents/templates/create')}
          />
        </div>
      </CardHeader>
      <CardBody>
        <DataTableComponent
          columns={[...ContractTemplatesTableHeader, buildActiveVolunteersActionColumn()]}
          data={templates}
          //   loading={isLoadingContractTemplate}
          pagination
          // paginationPerPage={10}
          selectableRows
          selectableRowsSingle
          paginationTotalRows={templates.length}
          // paginationDefaultPage={query.page as number}
          // onChangeRowsPerPage={onRowsPerPageChange}
          onChangePage={onChangePage}
          onSort={onSort}
        />
      </CardBody>
    </Card>
  );
};

export default NewTemplatesTable;
