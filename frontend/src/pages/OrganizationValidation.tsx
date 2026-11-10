import React, { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { differenceInCalendarDays } from 'date-fns';
import {
  CheckCircleIcon,
  ClockIcon,
  NoSymbolIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import PageLayout from '../layouts/PageLayout';
import PageHeader from '../components/PageHeader';
import Card from '../layouts/CardLayout';
import CardHeader from '../components/CardHeader';
import CardBody from '../components/CardBody';
import StatisticsCard from '../components/StatisticsCard';
import StatusBadge from '../components/StatusBadge';
import InitialsAvatar from '../components/InitialsAvatar';
import EmptyContent from '../components/EmptyContent';
import LoadingContent from '../components/LoadingContent';
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
import { useAdminOrganizationsQuery } from '../services/admin/admin-lists.service';
import { formatDate } from '../common/utils/utils';

type PendingAction = { kind: 'validate' | 'suspend'; organization: IPendingOrganization };

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex flex-col gap-1 min-w-0">
    <dt className="text-xs uppercase tracking-wide text-cool-gray-500 font-robotoMedium">
      {label}
    </dt>
    <dd className="text-sm text-cool-gray-900 break-words">{children}</dd>
  </div>
);

// /admin/validation: NGOs that confirmed their email and wait for a super admin (decision 1).
const OrganizationValidation = () => {
  const { t } = useTranslation('validation');
  const { isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [action, setAction] = useState<PendingAction | null>(null);

  const { data, isLoading, error } = usePendingValidationQuery(isSuperAdmin);
  const active = useAdminOrganizationsQuery({ page: 1, limit: 1, status: 'active' }, isSuperAdmin);
  const suspended = useAdminOrganizationsQuery(
    { page: 1, limit: 1, status: 'suspended' },
    isSuperAdmin,
  );
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

  const pending = data ?? [];
  const busy = validate.isLoading || suspend.isLoading;
  const total = (count?: number) => (count === undefined ? '-' : String(count));

  const waiting = (registeredOn: string) => {
    const days = differenceInCalendarDays(new Date(), new Date(registeredOn));
    return days < 1 ? t('waiting_today') : t('waiting_days', { count: days });
  };

  return (
    <PageLayout>
      <PageHeader subtitle={t('description')}>{t('title')}</PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatisticsCard
          label={t('stats.pending')}
          value={isLoading ? '-' : String(pending.length)}
          icon={<ClockIcon className="w-5 h-5 text-figure-amber" aria-hidden="true" />}
          info={pending.length ? t('stats.pending_info') : undefined}
        />
        <StatisticsCard
          label={t('stats.active')}
          value={total(active.data?.meta.totalItems)}
          icon={<CheckCircleIcon className="w-5 h-5 text-figure-green" aria-hidden="true" />}
          action={{ label: t('stats.see_all'), onClick: () => navigate('/admin/organizations') }}
        />
        <StatisticsCard
          label={t('stats.suspended')}
          value={total(suspended.data?.meta.totalItems)}
          icon={<NoSymbolIcon className="w-5 h-5 text-figure-red" aria-hidden="true" />}
          action={{ label: t('stats.see_all'), onClick: () => navigate('/admin/organizations') }}
        />
      </div>

      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2>{t('list_title', { count: pending.length })}</h2>
        <span className="text-sm text-cool-gray-500">{t('cui_hint')}</span>
      </div>

      {isLoading && (
        <Card>
          <LoadingContent />
        </Card>
      )}

      {!isLoading && pending.length === 0 && (
        <Card>
          <EmptyContent
            icon={<ShieldCheckIcon className="w-6 h-6" />}
            title={t('empty.title')}
            description={t('empty.description')}
          />
        </Card>
      )}

      {pending.map((organization) => (
        <Card key={organization.id}>
          <CardHeader>
            <div className="flex items-center gap-3 min-w-0">
              {organization.logo ? (
                <a href={organization.logo} target="_blank" rel="noreferrer" className="shrink-0">
                  <img
                    src={organization.logo}
                    alt=""
                    className="w-12 h-12 rounded-lg border border-cool-gray-200 object-contain"
                  />
                </a>
              ) : (
                <InitialsAvatar name={organization.name} />
              )}
              <div className="min-w-0">
                <h3 className="font-titilliumBold text-lg break-words">{organization.name}</h3>
                <p className="text-sm text-cool-gray-500">
                  {t('registered', { date: formatDate(organization.registeredOn) })} ·{' '}
                  {waiting(organization.registeredOn)}
                </p>
              </div>
            </div>
            <StatusBadge tone="amber">{t('pending_badge')}</StatusBadge>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="flex flex-col gap-2 rounded-lg border border-cool-gray-200 bg-cool-gray-50 p-4 self-start w-full">
                <span className="text-xs uppercase tracking-wide text-cool-gray-500 font-robotoMedium">
                  {t('columns.tax_id')}
                </span>
                <span className="font-titilliumBold text-2xl text-navy tracking-wide break-all">
                  {organization.taxId}
                </span>
                <span className="text-xs text-cool-gray-500">{t('cui_check')}</span>
              </div>

              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-5 lg:col-span-2">
                <Field label={t('fields.contact')}>
                  <span className="block text-sm">{organization.email}</span>
                  <span className="block text-sm text-cool-gray-500">{organization.phone}</span>
                </Field>
                <Field label={t('columns.first_admin')}>
                  {organization.firstAdmin ? (
                    <>
                      <span className="block text-sm">{organization.firstAdmin.name}</span>
                      <span className="block text-sm text-cool-gray-500">
                        {organization.firstAdmin.email}
                      </span>
                      <span className="block text-sm text-cool-gray-500">
                        {organization.firstAdmin.phone}
                      </span>
                    </>
                  ) : (
                    '-'
                  )}
                </Field>
                {organization.address && (
                  <Field label={t('fields.address')}>{organization.address}</Field>
                )}
                {organization.website && (
                  <Field label={t('fields.website')}>
                    <a
                      className="text-sm text-navy underline break-all"
                      href={organization.website}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {organization.website}
                    </a>
                  </Field>
                )}
                {organization.description && (
                  <div className="sm:col-span-2">
                    <Field label={t('fields.description')}>{organization.description}</Field>
                  </div>
                )}
                <div className="sm:col-span-2">
                  <Field label={t('fields.declarations')}>
                    {/* #510: registration is refused without both, so every NGO here ticked them */}
                    <ul className="flex flex-col gap-1.5 mt-1">
                      {(['registered_ngo', 'representative'] as const).map((key) => (
                        <li key={key} className="flex items-start gap-2">
                          <CheckCircleIcon
                            className="w-5 h-5 shrink-0 text-figure-green"
                            aria-hidden="true"
                          />
                          <span className="text-sm">{t(`declarations.${key}`)}</span>
                        </li>
                      ))}
                    </ul>
                  </Field>
                </div>
              </dl>
            </div>
          </CardBody>
          <div className="flex flex-wrap items-center justify-end gap-3 sm:px-6 px-4 py-4">
            <Button
              label={t('actions.suspend')}
              className="btn-outline-danger"
              disabled={busy}
              onClick={() => setAction({ kind: 'suspend', organization })}
            />
            <Button
              label={t('actions.validate')}
              className="btn-primary"
              disabled={busy}
              onClick={() => setAction({ kind: 'validate', organization })}
            />
          </div>
        </Card>
      ))}

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
