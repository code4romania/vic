import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowTopRightOnSquareIcon, PencilIcon, UserGroupIcon } from '@heroicons/react/24/outline';
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
    </PageLayout>
  );
};

export default Settings;
