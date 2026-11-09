import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TableColumn } from 'react-data-table-component';
import { useTranslation } from 'react-i18next';
import PageLayout from '../layouts/PageLayout';
import PageHeader from '../components/PageHeader';
import Card from '../layouts/CardLayout';
import CardBody from '../components/CardBody';
import DataTableComponent from '../components/DataTableComponent';
import DataTableFilters from '../components/DataTableFilters';
import Tabs from '../components/Tabs';
import { SelectItem } from '../components/Select';
import SelectFilter from '../containers/SelectFilter';
import Forbidden from './Forbidden';
import { useAuth } from '../hooks/useAuth';
import { formatDate } from '../common/utils/utils';
import {
  AdminOrganizationStatus,
  IAdminOrganizationListItem,
  IAdminVolunteerListItem,
} from '../services/admin/admin-lists.api';
import {
  useAdminOrganizationsQuery,
  useAdminVolunteersQuery,
} from '../services/admin/admin-lists.service';

type AdminList = 'organizations' | 'volunteers';
const LISTS: AdminList[] = ['organizations', 'volunteers'];
const STATUSES: AdminOrganizationStatus[] = ['pending', 'active', 'suspended'];

const Contact = ({ email, phone }: { email: string; phone: string }) => (
  <div className="flex flex-col py-2">
    <span>{email}</span>
    <small className="text-cool-gray-500">{phone}</small>
  </div>
);

// #511: /admin/organizations and /admin/volunteers, for VIC super admins.
const SuperAdminLists = () => {
  const { t } = useTranslation('super_admin');
  const { isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const params = useParams<{ list: AdminList }>();
  const list: AdminList = params.list === 'volunteers' ? 'volunteers' : 'organizations';

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState<string>();
  const [status, setStatus] = useState<AdminOrganizationStatus>();

  const query = { page, limit, search: search || undefined };
  const organizations = useAdminOrganizationsQuery(
    { ...query, status },
    isSuperAdmin && list === 'organizations',
  );
  const volunteers = useAdminVolunteersQuery(query, isSuperAdmin && list === 'volunteers');

  if (!isSuperAdmin) return <Forbidden />;

  const tabs: SelectItem<AdminList>[] = LISTS.map((key) => ({ key, value: t(`tabs.${key}`) }));
  const statusOptions: SelectItem<string>[] = STATUSES.map((key) => ({
    key,
    value: t(`status.${key}`),
  }));

  const reset = () => {
    setPage(1);
    setSearch(undefined);
    setStatus(undefined);
  };

  const organizationColumns: TableColumn<IAdminOrganizationListItem>[] = [
    {
      id: 'name',
      name: t('columns.organization'),
      grow: 2,
      cell: (row) => <span className="font-robotoBold">{row.name}</span>,
    },
    { id: 'taxId', name: t('columns.tax_id'), selector: (row) => row.taxId || '-' },
    {
      id: 'contact',
      name: t('columns.contact'),
      grow: 2,
      cell: (row) => <Contact email={row.email} phone={row.phone} />,
    },
    { id: 'status', name: t('columns.status'), selector: (row) => t(`status.${row.status}`) },
    { id: 'volunteers', name: t('columns.volunteers'), selector: (row) => row.volunteers },
    {
      id: 'createdOn',
      name: t('columns.registered_on'),
      selector: (row) => formatDate(row.createdOn),
    },
  ];

  const volunteerColumns: TableColumn<IAdminVolunteerListItem>[] = [
    {
      id: 'name',
      name: t('columns.name'),
      grow: 2,
      cell: (row) => <span className="font-robotoBold">{row.name}</span>,
    },
    {
      id: 'contact',
      name: t('columns.contact'),
      grow: 2,
      cell: (row) => <Contact email={row.email} phone={row.phone} />,
    },
    {
      id: 'organizations',
      name: t('columns.organizations'),
      grow: 3,
      selector: (row) => (row.organizations.length ? row.organizations.join(', ') : '-'),
      wrap: true,
    },
    {
      id: 'createdOn',
      name: t('columns.account_created'),
      selector: (row) => formatDate(row.createdOn),
    },
  ];

  const pagination = (total = 0) => ({
    pagination: true,
    paginationPerPage: limit,
    paginationTotalRows: total,
    paginationDefaultPage: page,
    onChangePage: setPage,
    onChangeRowsPerPage: (rows: number) => {
      setLimit(rows);
      setPage(1);
    },
  });

  return (
    <PageLayout>
      <PageHeader>{t('title')}</PageHeader>
      <Tabs<AdminList>
        tabs={tabs}
        defaultTab={tabs.find((tab) => tab.key === list)}
        onClick={(key) => {
          reset();
          navigate(`/admin/${key}`);
        }}
      >
        <DataTableFilters
          key={list}
          searchPlaceholder={t(`search.${list}`)}
          searchValue={search}
          onSearch={(value) => {
            setSearch(value);
            setPage(1);
          }}
          onResetFilters={reset}
        >
          {list === 'organizations' && (
            <SelectFilter
              label={t('columns.status')}
              options={statusOptions}
              defaultValue={status}
              placeholder={t('status.all')}
              onChange={(item) => {
                setStatus(item?.key as AdminOrganizationStatus | undefined);
                setPage(1);
              }}
              allowDeselect
            />
          )}
        </DataTableFilters>
        <Card>
          <CardBody>
            {list === 'organizations' ? (
              <DataTableComponent<IAdminOrganizationListItem>
                columns={organizationColumns}
                data={organizations.data?.items}
                loading={organizations.isLoading}
                {...pagination(organizations.data?.meta.totalItems)}
              />
            ) : (
              <DataTableComponent<IAdminVolunteerListItem>
                columns={volunteerColumns}
                data={volunteers.data?.items}
                loading={volunteers.isLoading}
                {...pagination(volunteers.data?.meta.totalItems)}
              />
            )}
          </CardBody>
        </Card>
      </Tabs>
    </PageLayout>
  );
};

export default SuperAdminLists;
