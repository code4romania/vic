import React, { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
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
import ConfirmationModal from '../components/ConfirmationModal';
import Forbidden from './Forbidden';
import { useAuth } from '../hooks/useAuth';
import { useErrorToast, useSuccessToast } from '../hooks/useToast';
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
import {
  useSuspendOrganizationMutation,
  useUnsuspendOrganizationMutation,
} from '../services/admin/admin-organizations.service';

type AdminList = 'organizations' | 'volunteers';
const LISTS: AdminList[] = ['organizations', 'volunteers'];
const STATUSES: AdminOrganizationStatus[] = ['pending', 'active', 'suspended'];
const DEFAULT_LIMIT = 10;

type RowAction = { kind: 'suspend' | 'unsuspend'; organization: IAdminOrganizationListItem };

const positive = (value: string | null, fallback: number): number => {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : fallback;
};

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

  // The filters live in the URL (replace, not push): a link such as "Vezi toate" can open the list
  // already filtered, and a reload or the back button keeps them.
  const [searchParams, setSearchParams] = useSearchParams();
  const page = positive(searchParams.get('page'), 1);
  const limit = positive(searchParams.get('limit'), DEFAULT_LIMIT);
  const search = searchParams.get('search') || undefined;
  const statusParam = searchParams.get('status') as AdminOrganizationStatus | null;
  const status = statusParam && STATUSES.includes(statusParam) ? statusParam : undefined;

  const updateParams = (updates: Record<string, string | number | undefined>) =>
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        Object.entries(updates).forEach(([key, value]) =>
          value === undefined || value === '' ? next.delete(key) : next.set(key, String(value)),
        );
        if (next.get('page') === '1') next.delete('page');
        if (next.get('limit') === String(DEFAULT_LIMIT)) next.delete('limit');
        return next;
      },
      { replace: true },
    );

  const [action, setAction] = useState<RowAction | null>(null);
  const suspend = useSuspendOrganizationMutation();
  const unsuspend = useUnsuspendOrganizationMutation();

  const query = { page, limit, search };
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

  const reset = () => updateParams({ page: undefined, search: undefined, status: undefined });

  const confirm = () => {
    if (!action) return;
    const { kind, organization } = action;
    setAction(null);
    (kind === 'suspend' ? suspend : unsuspend).mutate(organization.id, {
      onSuccess: () => useSuccessToast(t(`toast.${kind}`, { name: organization.name })),
      onError: () => useErrorToast(t('errors.generic')),
    });
  };
  const busy = suspend.isLoading || unsuspend.isLoading;

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
      cell: (row) => {
        if (row.status === 'pending')
          return (
            <Button
              type="button"
              className="btn-text-primary px-2"
              label={t('review')}
              aria-label={`${t('review')} ${row.name}`}
              onClick={() => navigate('/admin/validation')}
            />
          );
        const kind = row.status === 'suspended' ? 'unsuspend' : 'suspend';
        return (
          <Button
            type="button"
            className={kind === 'suspend' ? 'btn-text-danger px-2' : 'btn-text-primary px-2'}
            label={t(`actions.${kind}`)}
            aria-label={`${t(`actions.${kind}`)} ${row.name}`}
            disabled={busy}
            onClick={() => setAction({ kind, organization: row })}
          />
        );
      },
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
    onChangePage: (next: number) => updateParams({ page: next }),
    onChangeRowsPerPage: (rows: number) => updateParams({ limit: rows, page: undefined }),
  });

  const current = list === 'organizations' ? organizations : volunteers;
  const found = current.data?.meta.totalItems;

  return (
    <PageLayout>
      <PageHeader subtitle={t(`subtitle.${list}`)}>{t('title')}</PageHeader>
      <Tabs<AdminList>
        tabs={tabs}
        defaultTab={tabs.find((tab) => tab.key === list)}
        onClick={(key) => navigate(`/admin/${key}`)}
      >
        <DataTableFilters
          key={list}
          searchPlaceholder={t(`search.${list}`)}
          searchValue={search}
          onSearch={(value) => updateParams({ search: value, page: undefined })}
          onResetFilters={reset}
          results={found !== undefined && <span>{t(`found.${list}`, { count: found })}</span>}
        >
          {list === 'organizations' && (
            <SelectFilter
              label={t('columns.status')}
              options={statusOptions}
              defaultValue={status}
              placeholder={t('status.all')}
              onChange={(item) => updateParams({ status: item?.key, page: undefined })}
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
                error={organizations.error}
                onRetry={organizations.refetch}
                {...pagination(organizations.data?.meta.totalItems)}
              />
            ) : (
              <DataTableComponent<IAdminVolunteerListItem>
                columns={volunteerColumns}
                data={volunteers.data?.items}
                loading={volunteers.isLoading}
                error={volunteers.error}
                onRetry={volunteers.refetch}
                {...pagination(volunteers.data?.meta.totalItems)}
              />
            )}
          </CardBody>
        </Card>
      </Tabs>
      {action && (
        <ConfirmationModal
          title={t(`confirm.${action.kind}.title`)}
          description={t(`confirm.${action.kind}.description`, { name: action.organization.name })}
          confirmBtnLabel={t(`actions.${action.kind}`)}
          confirmBtnClassName={action.kind === 'suspend' ? 'btn-danger' : 'btn-primary'}
          onClose={() => setAction(null)}
          onConfirm={confirm}
        />
      )}
    </PageLayout>
  );
};

export default SuperAdminLists;
