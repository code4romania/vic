import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDownTrayIcon,
  ArrowTopRightOnSquareIcon,
  ClockIcon,
  EnvelopeIcon,
  PencilIcon,
  ShieldCheckIcon,
  TrashIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import i18n from '../common/config/i18n';
import CardBody from '../components/CardBody';
import CardHeader from '../components/CardHeader';
import FormReadOnlyElement from '../components/FormReadOnlyElement';
import LoadingContent from '../components/LoadingContent';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../hooks/useAuth';
import Card from '../layouts/CardLayout';
import PageLayout from '../layouts/PageLayout';
import { useOrganizationQuery } from '../services/organization/organization.service';
import Button from '../components/Button';
import ChangeEmailModal from '../components/ChangeEmailModal';
import DeleteOrganizationModal from '../components/DeleteOrganizationModal';
import { downloadExcel } from '../common/utils/utils';
import { useErrorToast } from '../hooks/useToast';
import { getBackup } from '../services/security/security.api';

// Read at render time, so the links follow the deployed config.
const aboutLinks = () => [
  { key: 'terms', url: import.meta.env.VITE_TERMS_URL },
  { key: 'privacy', url: import.meta.env.VITE_PRIVACY_URL },
  { key: 'help', url: import.meta.env.VITE_HELP_CENTER_URL },
];

const ActionLink = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => (
  <Link
    to={to}
    className="btn-outline-secondary inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm"
  >
    {icon}
    {label}
  </Link>
);

// #506: the admin's own account, kept apart from the organization's public profile.
// #509: Despre card with the external links, which come from config.
const Settings = () => {
  const { profile } = useAuth();
  const { data: organization, isLoading } = useOrganizationQuery();
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);

  // #508: everything the organization has in VIC, as one Excel workbook
  const onBackup = async () => {
    setIsBackingUp(true);
    try {
      const { data, fileName } = await getBackup();
      downloadExcel(data, fileName);
    } catch {
      useErrorToast(i18n.t('settings:security.backup.error'));
    } finally {
      setIsBackingUp(false);
    }
  };

  return (
    <PageLayout>
      <PageHeader>{i18n.t('settings:title')}</PageHeader>

      <Card>
        <CardHeader>
          <h2>{i18n.t('settings:account.title')}</h2>
        </CardHeader>
        <CardBody>
          <div className="flex flex-col gap-6">
            <p className="text-cool-gray-500">{i18n.t('settings:account.description')}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormReadOnlyElement label={i18n.t('general:name')} value={profile?.name || '-'} />
              <FormReadOnlyElement label={i18n.t('general:email')} value={profile?.email || '-'} />
              <FormReadOnlyElement label={i18n.t('general:phone')} value={profile?.phone || '-'} />
            </div>
            <p className="text-cool-gray-500 text-sm">{i18n.t('settings:account.login')}</p>
            <div>
              <ActionLink
                to="/organization/team"
                icon={<UserGroupIcon className="h-5 w-5" />}
                label={i18n.t('settings:account.team')}
              />
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2>{i18n.t('settings:organization.title')}</h2>
          <ActionLink
            to="/organization/edit"
            icon={<PencilIcon className="h-5 w-5" />}
            label={i18n.t('settings:organization.edit')}
          />
        </CardHeader>
        <CardBody>
          {isLoading && <LoadingContent />}
          {organization && (
            <div className="flex flex-col gap-6">
              <p className="text-cool-gray-500">{i18n.t('settings:organization.description')}</p>
              <div className="flex items-center gap-4">
                <img
                  src={organization.logo || 'logo.svg'}
                  alt={organization.name}
                  className="h-16 w-16 object-contain rounded-md border border-cool-gray-200 p-1"
                />
                <h3>{organization.name}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormReadOnlyElement label={i18n.t('general:email')} value={organization.email} />
                <FormReadOnlyElement label={i18n.t('general:phone')} value={organization.phone} />
                <FormReadOnlyElement
                  label={i18n.t('register_organization:form.website.label')}
                  value={organization.website || '-'}
                />
              </div>
              <FormReadOnlyElement
                label={i18n.t('general:description')}
                value={organization.description || '-'}
              />
            </div>
          )}
        </CardBody>
      </Card>

      {/* #508: Date și securitate */}
      <Card>
        <CardHeader>
          <h2>{i18n.t('settings:security.title')}</h2>
        </CardHeader>
        <CardBody>
          <ul className="flex flex-col divide-y divide-cool-gray-200">
            <li className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4 first:pt-0">
              <div className="flex gap-3">
                <ShieldCheckIcon className="h-6 w-6 shrink-0 text-green-600" />
                <div className="flex flex-col gap-1">
                  <p className="font-medium">{i18n.t('settings:security.two_factor.title')}</p>
                  <p className="text-sm text-cool-gray-500">
                    {i18n.t('settings:security.two_factor.description')}
                  </p>
                </div>
              </div>
              <span className="self-start sm:self-center rounded-full bg-green-100 px-3 py-1 text-sm text-green-800 whitespace-nowrap">
                {i18n.t('settings:security.two_factor.on')}
              </span>
            </li>
            <li className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4">
              <div className="flex gap-3">
                <EnvelopeIcon className="h-6 w-6 shrink-0 text-cool-gray-400" />
                <div className="flex flex-col gap-1">
                  <p className="font-medium">{i18n.t('settings:security.email.label')}</p>
                  <p className="text-sm text-cool-gray-500 break-all">{profile?.email}</p>
                </div>
              </div>
              <Button
                className="btn-outline-secondary self-start sm:self-center"
                label={i18n.t('settings:security.email.action')}
                onClick={() => setShowChangeEmail(true)}
              />
            </li>
            <li className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4">
              <div className="flex gap-3">
                <ArrowDownTrayIcon className="h-6 w-6 shrink-0 text-cool-gray-400" />
                <div className="flex flex-col gap-1">
                  <p className="font-medium">{i18n.t('settings:security.backup.title')}</p>
                  <p className="text-sm text-cool-gray-500">
                    {i18n.t('settings:security.backup.description')}
                  </p>
                </div>
              </div>
              <Button
                className="btn-outline-secondary self-start sm:self-center"
                label={i18n.t(
                  isBackingUp
                    ? 'settings:security.backup.loading'
                    : 'settings:security.backup.action',
                )}
                disabled={isBackingUp}
                onClick={onBackup}
              />
            </li>
            <li className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4 last:pb-0">
              <div className="flex gap-3">
                <ClockIcon className="h-6 w-6 shrink-0 text-cool-gray-400" />
                <div className="flex flex-col gap-1">
                  <p className="font-medium">{i18n.t('settings:security.history.title')}</p>
                  <p className="text-sm text-cool-gray-500">
                    {i18n.t('settings:security.history.description')}
                  </p>
                </div>
              </div>
              <ActionLink
                to="/actions-archive"
                icon={<ClockIcon className="h-5 w-5" />}
                label={i18n.t('settings:security.history.action')}
              />
            </li>
          </ul>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-red-600">{i18n.t('settings:danger.title')}</h2>
        </CardHeader>
        <CardBody>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-col gap-1">
              <p className="font-medium">{i18n.t('settings:danger.delete_title')}</p>
              <p className="text-sm text-cool-gray-500">
                {i18n.t('settings:danger.delete_description')}
              </p>
            </div>
            <Button
              className="btn-danger self-start sm:self-center whitespace-nowrap"
              icon={<TrashIcon className="h-5 w-5" />}
              label={i18n.t('settings:danger.action')}
              disabled={!organization}
              onClick={() => setShowDelete(true)}
            />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2>{i18n.t('settings:about.title')}</h2>
        </CardHeader>
        <CardBody>
          <ul className="flex flex-col divide-y divide-cool-gray-200">
            {aboutLinks()
              .filter((link) => !!link.url)
              .map((link) => (
                <li key={link.key}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-3 py-3 hover:text-cool-gray-900"
                  >
                    {i18n.t(`settings:about.${link.key}`)}
                    <ArrowTopRightOnSquareIcon className="h-5 w-5 text-cool-gray-400" />
                  </a>
                </li>
              ))}
          </ul>
          <small className="text-cool-gray-400">
            {i18n.t('settings:about.version', { version: APP_VERSION })}
          </small>
        </CardBody>
      </Card>
      {showChangeEmail && <ChangeEmailModal onClose={() => setShowChangeEmail(false)} />}
      {showDelete && organization && (
        <DeleteOrganizationModal
          organizationName={organization.name}
          onClose={() => setShowDelete(false)}
        />
      )}
    </PageLayout>
  );
};

export default Settings;
