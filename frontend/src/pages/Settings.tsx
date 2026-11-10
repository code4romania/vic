import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowDownTrayIcon,
  ArrowTopRightOnSquareIcon,
  BellIcon,
  BuildingOffice2Icon,
  CircleStackIcon,
  ClockIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  LockClosedIcon,
  PencilIcon,
  PlusIcon,
  QuestionMarkCircleIcon,
  TrashIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import i18n from '../common/config/i18n';
import LoadingContent from '../components/LoadingContent';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../hooks/useAuth';
import PageLayout from '../layouts/PageLayout';
import { useOrganizationQuery } from '../services/organization/organization.service';
import ChangeEmailModal from '../components/ChangeEmailModal';
import DeleteOrganizationModal from '../components/DeleteOrganizationModal';
import { downloadExcel } from '../common/utils/utils';
import { useErrorToast, useSuccessToast } from '../hooks/useToast';
import { getBackup } from '../services/security/security.api';
import { getVolunteersForDownload } from '../services/volunteer/volunteer.api';
import Tabs, { TabItem } from '../components/Tabs';
import StatusBadge from '../components/StatusBadge';
import InitialsAvatar from '../components/InitialsAvatar';
import {
  SettingsCard,
  SettingsField,
  SettingsRow,
  SettingsSubtitle,
} from '../components/SettingsBlocks';
import TeamAddAdminModal, {
  showTeamError,
  TEAM_STATUS_TONE,
} from '../components/TeamAddAdminModal';
import { useAddAdminMutation, useTeamQuery } from '../services/team/team.service';

const t = (key: string, options?: Record<string, unknown>): string =>
  `${i18n.t(`settings:${key}`, options)}`;

enum SettingsTab {
  ACCOUNT = 'account',
  NOTIFICATIONS = 'notifications',
  SECURITY = 'security',
  ABOUT = 'about',
}

const TABS: TabItem<SettingsTab>[] = Object.values(SettingsTab).map((key) => ({
  key,
  value: t(`tabs.${key}`),
}));

// Read at render time, so the links follow the deployed config.
const aboutLinks = () => [
  { key: 'terms', url: import.meta.env.VITE_TERMS_URL },
  { key: 'privacy', url: import.meta.env.VITE_PRIVACY_URL },
  { key: 'help', url: import.meta.env.VITE_HELP_CENTER_URL },
];

const ActionLink = ({ to, icon, label }: { to: string; icon?: React.ReactNode; label: string }) => (
  <Link
    to={to}
    className="btn-outline-secondary inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm whitespace-nowrap"
  >
    {icon}
    {label}
  </Link>
);

// A button that keeps its label on small screens too (the shared Button shows only the icon there).
interface RowButtonProps extends React.ComponentPropsWithoutRef<'button'> {
  icon?: React.ReactNode;
  label: string;
  className?: string;
}

const RowButton = ({
  icon,
  label,
  className = 'btn-outline-secondary',
  ...rest
}: RowButtonProps) => (
  <button type="button" className={`${className} whitespace-nowrap`} {...rest}>
    {icon}
    {label}
  </button>
);

// Setări cont: the admin's own data and the organization's identity (#506), and who has access.
const AccountTab = () => {
  const { profile } = useAuth();
  const { data: organization, isLoading } = useOrganizationQuery();
  const { data: team, isLoading: isTeamLoading } = useTeamQuery();
  const addAdmin = useAddAdminMutation();
  const [showAdd, setShowAdd] = useState(false);

  return (
    <>
      <SettingsCard
        icon={BuildingOffice2Icon}
        title={t('account.title')}
        subtitle={t('account.description')}
      >
        {isLoading && <LoadingContent />}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SettingsField label={t('account.organization')} value={organization?.name} />
          <SettingsField label={t('account.tax_id')} value={organization?.taxId} />
          <SettingsField label={t('account.name')} value={profile?.name} />
          <SettingsField label={t('account.email')} value={profile?.email} />
          <SettingsField label={t('account.phone')} value={profile?.phone} />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-cool-gray-200">
          <p className="text-sm text-cool-gray-500">{t('account.edit_hint')}</p>
          <ActionLink
            to="/organization"
            icon={<PencilIcon className="h-4 w-4" aria-hidden="true" />}
            label={t('organization.edit')}
          />
        </div>
      </SettingsCard>

      <SettingsCard icon={UserGroupIcon} title={t('team.title')} subtitle={t('team.description')}>
        {isTeamLoading && <LoadingContent />}
        <ul className="flex flex-col gap-2">
          {team?.map((member) => (
            <li
              key={member.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-cool-gray-50 border border-cool-gray-100 px-4 py-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <InitialsAvatar name={member.name} size="sm" />
                <div className="flex flex-col min-w-0">
                  <span className="font-robotoMedium text-cool-gray-900">
                    {member.name}
                    {member.id === profile?.id && (
                      <span className="text-cool-gray-500 font-roboto">
                        {' '}
                        ({i18n.t('team:you')})
                      </span>
                    )}
                  </span>
                  <span className="text-sm text-cool-gray-500 truncate">{member.email}</span>
                </div>
              </div>
              <StatusBadge tone={TEAM_STATUS_TONE[member.status]}>
                {i18n.t(`team:status_short.${member.status}`)}
              </StatusBadge>
            </li>
          ))}
        </ul>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            className="btn-outline-secondary flex-1 justify-center"
            onClick={() => setShowAdd(true)}
          >
            <PlusIcon className="h-5 w-5" aria-hidden="true" />
            {t('team.invite')}
          </button>
          <ActionLink to="/organization/team" label={t('team.manage')} />
        </div>
        <p className="text-xs text-cool-gray-500">{t('team.note')}</p>
      </SettingsCard>

      {showAdd && (
        <TeamAddAdminModal
          isLoading={addAdmin.isLoading}
          onClose={() => setShowAdd(false)}
          onSubmit={(data) =>
            addAdmin.mutate(data, {
              onSuccess: ({ maskedEmail }) => {
                setShowAdd(false);
                useSuccessToast(i18n.t('team:toast.invite_sent', { email: maskedEmail }));
              },
              onError: showTeamError,
            })
          }
        />
      )}
    </>
  );
};

// Notificări: VIC emails admins only what they need to sign in and confirm; nothing to turn off.
const NotificationsTab = ({ onChangeEmail }: { onChangeEmail: () => void }) => {
  const { profile } = useAuth();
  const emails = ['login', 'codes', 'invites'];

  return (
    <SettingsCard
      icon={BellIcon}
      title={t('notifications.title')}
      subtitle={t('notifications.description')}
    >
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-robotoMedium text-cool-gray-700">
          {t('notifications.email')}
        </span>
        <div className="flex flex-col sm:flex-row gap-3">
          <p className="flex-1 flex items-center gap-2 rounded-lg bg-cool-gray-50 border border-cool-gray-200 px-3 py-2.5 text-cool-gray-900 break-all">
            <EnvelopeIcon className="w-5 h-5 shrink-0 text-cool-gray-400" aria-hidden="true" />
            {profile?.email}
          </p>
          <RowButton
            className="btn-secondary"
            label={t('security.email.action')}
            onClick={onChangeEmail}
          />
        </div>
        <small className="text-cool-gray-500">{t('notifications.email_help')}</small>
      </div>
      <SettingsSubtitle>{t('notifications.list_title')}</SettingsSubtitle>
      <div className="flex flex-col divide-y divide-cool-gray-200 -mt-2">
        {emails.map((key) => (
          <SettingsRow
            key={key}
            boxed={false}
            title={t(`notifications.items.${key}.title`)}
            description={t(`notifications.items.${key}.description`)}
            action={<StatusBadge tone="green">{t('notifications.always_on')}</StatusBadge>}
          />
        ))}
      </div>
      <p className="text-sm text-cool-gray-600">
        {t('notifications.approvals')}{' '}
        <Link to="/approvals" className="font-robotoMedium text-navy hover:underline">
          {t('notifications.approvals_link')}
        </Link>
      </p>
    </SettingsCard>
  );
};

// Date și securitate (#508): export, backup, history, the always-on email code, the login email
// and the danger zone.
const SecurityTab = ({ onChangeEmail }: { onChangeEmail: () => void }) => {
  const { profile } = useAuth();
  const { data: organization } = useOrganizationQuery();
  const [showDelete, setShowDelete] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // everything the organization has in VIC, as one Excel workbook
  const onBackup = async () => {
    setIsBackingUp(true);
    try {
      const { data, fileName } = await getBackup();
      downloadExcel(data, fileName);
    } catch {
      useErrorToast(t('security.backup.error'));
    } finally {
      setIsBackingUp(false);
    }
  };

  // the volunteers list, every status, the same file as on the Voluntari page
  const onExport = async () => {
    setIsExporting(true);
    try {
      const { data } = await getVolunteersForDownload({});
      downloadExcel(data as BlobPart, i18n.t('volunteers:download'));
    } catch {
      useErrorToast(t('security.export.error'));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <SettingsCard
        icon={CircleStackIcon}
        title={t('security.data_title')}
        subtitle={t('security.data_description')}
      >
        <div className="flex flex-col gap-3">
          <SettingsRow
            title={t('security.export.title')}
            description={t('security.export.description')}
            action={
              <RowButton
                className="btn-outline-secondary"
                icon={<ArrowDownTrayIcon className="h-5 w-5" aria-hidden="true" />}
                label={t(isExporting ? 'security.backup.loading' : 'security.export.action')}
                disabled={isExporting}
                onClick={onExport}
              />
            }
          />
          <SettingsRow
            title={t('security.backup.title')}
            description={t('security.backup.description')}
            action={
              <RowButton
                className="btn-outline-secondary"
                icon={<ArrowDownTrayIcon className="h-5 w-5" aria-hidden="true" />}
                label={t(isBackingUp ? 'security.backup.loading' : 'security.backup.action')}
                disabled={isBackingUp}
                onClick={onBackup}
              />
            }
          />
          <SettingsRow
            title={t('security.history.title')}
            description={t('security.history.description')}
            action={
              <ActionLink
                to="/actions-archive"
                icon={<ClockIcon className="h-4 w-4" aria-hidden="true" />}
                label={t('security.history.action')}
              />
            }
          />
        </div>
        <SettingsSubtitle icon={LockClosedIcon}>{t('security.account_title')}</SettingsSubtitle>
        <div className="flex flex-col divide-y divide-cool-gray-200 -mt-2">
          <SettingsRow
            boxed={false}
            title={t('security.two_factor.title')}
            description={t('security.two_factor.description')}
            action={<StatusBadge tone="green">{t('security.two_factor.on')}</StatusBadge>}
          />
          <SettingsRow
            boxed={false}
            title={t('security.email.label')}
            description={
              <>
                <span className="block text-sm break-all text-cool-gray-900">{profile?.email}</span>
                <span className="block text-sm">{t('account.login')}</span>
              </>
            }
            action={
              <RowButton
                className="btn-outline-secondary"
                label={t('security.email.action')}
                onClick={onChangeEmail}
              />
            }
          />
        </div>
      </SettingsCard>

      <SettingsCard
        danger
        icon={ExclamationTriangleIcon}
        title={t('danger.title')}
        subtitle={t('danger.description')}
      >
        <SettingsRow
          boxed={false}
          danger
          title={t('danger.delete_title')}
          description={t('danger.delete_description')}
          action={
            <RowButton
              className="btn-danger whitespace-nowrap"
              icon={<TrashIcon className="h-5 w-5" aria-hidden="true" />}
              label={t('danger.action')}
              disabled={!organization}
              onClick={() => setShowDelete(true)}
            />
          }
        />
      </SettingsCard>
      {showDelete && organization && (
        <DeleteOrganizationModal
          organizationName={organization.name}
          onClose={() => setShowDelete(false)}
        />
      )}
    </>
  );
};

// Despre și sprijin (#509): the external links come from config; missing ones are hidden.
const AboutTab = () => (
  <SettingsCard
    icon={QuestionMarkCircleIcon}
    title={t('about.title')}
    subtitle={t('about.description')}
  >
    <ul className="flex flex-col gap-3">
      {aboutLinks()
        .filter((link) => !!link.url)
        .map((link) => (
          <li key={link.key}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t(`about.${link.key}`)}
              className="flex items-center justify-between gap-3 rounded-lg bg-cool-gray-50 border border-cool-gray-100 p-4 hover:bg-cool-gray-100"
            >
              <span className="flex flex-col gap-0.5">
                <span className="font-robotoMedium text-cool-gray-900">
                  {t(`about.${link.key}`)}
                </span>
                <span className="text-sm text-cool-gray-600">
                  {t(`about.${link.key}_description`)}
                </span>
              </span>
              <ArrowTopRightOnSquareIcon
                className="h-5 w-5 shrink-0 text-cool-gray-400"
                aria-hidden="true"
              />
            </a>
          </li>
        ))}
    </ul>
    <small className="text-cool-gray-500">{t('about.version', { version: APP_VERSION })}</small>
  </SettingsCard>
);

// #506 / #508 / #509, in the prototype's four tabs; the tab is kept in the URL (?tab=).
const Settings = () => {
  const [params, setParams] = useSearchParams();
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const tab = (TABS.find((item) => item.key === params.get('tab')) ?? TABS[0]).key;

  return (
    <PageLayout>
      <PageHeader subtitle={t('subtitle')}>{t('title')}</PageHeader>
      <Tabs<SettingsTab>
        tabs={TABS}
        defaultTab={TABS.find((item) => item.key === tab)}
        onClick={(key) => setParams({ tab: key })}
      >
        <div className="flex flex-col gap-6">
          {tab === SettingsTab.ACCOUNT && <AccountTab />}
          {tab === SettingsTab.NOTIFICATIONS && (
            <NotificationsTab onChangeEmail={() => setShowChangeEmail(true)} />
          )}
          {tab === SettingsTab.SECURITY && (
            <SecurityTab onChangeEmail={() => setShowChangeEmail(true)} />
          )}
          {tab === SettingsTab.ABOUT && <AboutTab />}
        </div>
      </Tabs>
      {showChangeEmail && <ChangeEmailModal onClose={() => setShowChangeEmail(false)} />}
    </PageLayout>
  );
};

export default Settings;
