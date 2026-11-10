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
import StatusBadge, { BadgeTone } from '../components/StatusBadge';
import MediaCell from '../components/MediaCell';
import InitialsAvatar from '../components/InitialsAvatar';
import Button from '../components/Button';
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

const STATUS_TONES: Record<AdminOrganizationStatus, BadgeTone> = {
  pending: 'amber',
  active: 'green',
  suspended: 'red',
};

const Contact = ({ email, phone }: { email: string; phone: string }) => (
  <div className="flex flex-col py-3 min-w-0">
    <span className="text-sm text-cool-gray-900 truncate">{email}</span>
    <small className="text-cool-gray-500">{phone || '-'}</small>
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
      grow: 3,
      minWidth: '17rem',
      cell: (row) => (
        <div className="py-3 w-full">
          <MediaCell title={row.name} subtitle={t('since', { date: formatDate(row.createdOn) })} />
        </div>
      ),
    },
    {
      id: 'taxId',
      name: t('columns.tax_id'),
      cell: (row) => (
        <span className="text-sm font-robotoMedium text-cool-gray-900 whitespace-nowrap">
          {row.taxId || '-'}
        </span>
      ),
    },
    {
      id: 'contact',
      name: t('columns.contact'),
      grow: 2,
      cell: (row) => <Contact email={row.email} phone={row.phone} />,
    },
    {
      id: 'status',
      name: t('columns.status'),
      cell: (row) => (
        <StatusBadge tone={STATUS_TONES[row.status]}>{t(`status.${row.status}`)}</StatusBadge>
      ),
    },
    {
      id: 'volunteers',
      name: t('columns.volunteers'),
      minWidth: '9rem',
      cell: (row) => <span className="text-sm font-robotoBold text-navy">{row.volunteers}</span>,
    },
    {
      id: 'validatedAt',
      name: t('columns.validated_on'),
      minWidth: '8rem',
      cell: (row) => (
        <span className="text-sm whitespace-nowrap">{formatDate(row.validatedAt)}</span>
      ),
    },
    {
      id: 'actions',
      name: '',
      minWidth: '9rem',
      right: true,
      cell: (row) =>
        row.status === 'pending' ? (
          <Button
            type="button"
            className="btn-text-primary px-2"
            label={t('review')}
            onClick={() => navigate('/admin/validation')}
          />
        ) : null,
    },
  ];

  const volunteerColumns: TableColumn<IAdminVolunteerListItem>[] = [
    {
      id: 'name',
      name: t('columns.name'),
      grow: 2,
      minWidth: '13rem',
      cell: (row) => (
        <div className="flex items-center gap-3 py-3 min-w-0">
          <InitialsAvatar name={row.name} />
          <span className="font-robotoMedium text-sm text-cool-gray-900 truncate">{row.name}</span>
        </div>
      ),
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
      cell: (row) =>
        row.organizations.length ? (
          <ul className="flex flex-wrap gap-1.5 py-3" aria-label={row.organizations.join(', ')}>
            {row.organizations.map((organization) => (
              <li
                key={organization}
                className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-robotoMedium text-cool-gray-700 ring-1 ring-inset ring-cool-gray-300 bg-white"
              >
                {organization}
              </li>
            ))}
          </ul>
        ) : (
          <span className="text-sm text-cool-gray-500">{t('no_organization')}</span>
        ),
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

  const current = list === 'organizations' ? organizations : volunteers;
  const found = current.data?.meta.totalItems;

  return (
    <PageLayout>
      <PageHeader subtitle={t(`subtitle.${list}`)}>{t('title')}</PageHeader>
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
          results={found !== undefined && <span>{t(`found.${list}`, { count: found })}</span>}
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
