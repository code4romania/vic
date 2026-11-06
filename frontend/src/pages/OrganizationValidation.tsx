import React, { useEffect, useState } from 'react';
import { TableColumn } from 'react-data-table-component';
import { useTranslation } from 'react-i18next';
import PageLayout from '../layouts/PageLayout';
import PageHeader from '../components/PageHeader';
import Card from '../layouts/CardLayout';
import CardBody from '../components/CardBody';
import DataTableComponent from '../components/DataTableComponent';
import ConfirmationModal from '../components/ConfirmationModal';
import Button from '../components/Button';
import Forbidden from './Forbidden';
import { useAuth } from '../hooks/useAuth';
import { useErrorToast, useSuccessToast } from '../hooks/useToast';
import { IPendingOrganization } from '../common/interfaces/organization.interface';
import {
  usePendingValidationQuery,
  useSuspendOrganizationMutation,
  useValidateOrganizationMutation,
} from '../services/admin/admin-organizations.service';
import { formatDate } from '../common/utils/utils';

type PendingAction = { kind: 'validate' | 'suspend'; organization: IPendingOrganization };

// /admin/validation: NGOs that confirmed their email and wait for a super admin (decision 1).
const OrganizationValidation = () => {
  const { t } = useTranslation('validation');
  const { isSuperAdmin } = useAuth();
  const [action, setAction] = useState<PendingAction | null>(null);

  const { data, isLoading, error } = usePendingValidationQuery(isSuperAdmin);
  const validate = useValidateOrganizationMutation();
  const suspend = useSuspendOrganizationMutation();

  useEffect(() => {
    if (error) useErrorToast(t('errors.load'));
  }, [error]);

  if (!isSuperAdmin) return <Forbidden />;

  const confirm = () => {
    if (!action) return;
    const { kind, organization } = action;
    setAction(null);
    (kind === 'validate' ? validate : suspend).mutate(organization.id, {
      onSuccess: () => useSuccessToast(t(`toast.${kind}`, { name: organization.name })),
      onError: () => useErrorToast(t('errors.generic')),
    });
  };

  const columns: TableColumn<IPendingOrganization>[] = [
    {
      id: 'name',
      name: t('columns.name'),
      grow: 2,
      cell: (organization) => (
        <div className="flex items-center gap-3 py-2">
          {organization.logo && (
            <a href={organization.logo} target="_blank" rel="noreferrer">
              <img src={organization.logo} alt="" className="h-10 w-10 object-contain" />
            </a>
          )}
          <div className="flex flex-col">
            <span>{organization.name}</span>
            <small className="text-cool-gray-500">{organization.email}</small>
            {organization.website && (
              <a
                className="text-xs underline"
                href={organization.website}
                target="_blank"
                rel="noreferrer"
              >
                {organization.website}
              </a>
            )}
          </div>
        </div>
      ),
    },
    { id: 'taxId', name: t('columns.tax_id'), selector: (organization) => organization.taxId },
    {
      id: 'registeredOn',
      name: t('columns.registered_on'),
      selector: (organization) => formatDate(organization.registeredOn),
    },
    {
      id: 'firstAdmin',
      name: t('columns.first_admin'),
      grow: 2,
      cell: (organization) =>
        organization.firstAdmin ? (
          <div className="flex flex-col">
            <span>{organization.firstAdmin.name}</span>
            <small className="text-cool-gray-500">{organization.firstAdmin.email}</small>
            <small className="text-cool-gray-500">{organization.firstAdmin.phone}</small>
          </div>
        ) : (
          '-'
        ),
    },
    {
      id: 'statute',
      name: t('columns.statute'),
      cell: (organization) => (
        <a className="underline" href={organization.statuteUrl} target="_blank" rel="noreferrer">
          {t('open_statute')}
        </a>
      ),
    },
    {
      name: '',
      minWidth: '14rem',
      cell: (organization) => (
        <div className="flex gap-2">
          <Button
            label={t('actions.validate')}
            className="btn-primary"
            onClick={() => setAction({ kind: 'validate', organization })}
          />
          <Button
            label={t('actions.suspend')}
            className="btn-outline-danger"
            onClick={() => setAction({ kind: 'suspend', organization })}
          />
        </div>
      ),
    },
  ];

  return (
    <PageLayout>
      <PageHeader>{t('title')}</PageHeader>
      <p className="text-cool-gray-500">{t('description')}</p>
      <Card>
        <CardBody>
          <DataTableComponent<IPendingOrganization>
            columns={columns}
            data={data}
            loading={isLoading || validate.isLoading || suspend.isLoading}
          />
        </CardBody>
      </Card>
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

export default OrganizationValidation;
