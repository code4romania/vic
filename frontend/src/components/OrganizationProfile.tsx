import React from 'react';
import Card from '../layouts/CardLayout';
import Button from './Button';
import CardHeader from './CardHeader';
import CardBody from './CardBody';
import FormInput from './FormInput';
import { PencilIcon } from '@heroicons/react/24/outline';
import FormTextarea from './FormTextarea';
import { useTranslation } from 'react-i18next';

interface IOrganization {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  logo: string;
  description: string;
}

interface OrganizationProfileProps {
  organization: IOrganization;
}

const OrganizationProfile = ({ organization }: OrganizationProfileProps) => {
  const { t } = useTranslation(['organization', 'general']);

  return (
    <Card>
      <CardHeader>
        <h2>{t('title')}</h2>
        <Button
          className="btn-outline-secondary w-20"
          label={t('edit')}
          icon={<PencilIcon className="h-5 w-5 text-cool-gray-500" />}
          onClick={() => console.log('navigate')}
        />
      </CardHeader>
      <CardBody>
        <div className="flex flex-col gap-6 w-full lg:w-[80%] mx-auto pt-4 pb-16">
          <div className="flex flex-col gap-1">
            <h2>{t('title')}</h2>
            <p className="text-cool-gray-500">{t('subtitle')}</p>
          </div>
          <div className="flex flex-col gap-1">
            <small className="text-cool-gray-500">{t('logo')}</small>
            <img
              src={organization.logo}
              alt="Organization Logo"
              className="h-28 object-contain self-start p-2"
            />
          </div>
          <FormInput label={t('organization_naming')} value={organization.name} readOnly />
          <FormInput label={t('email', { ns: 'general' })} value={organization.email} readOnly />
          <FormInput label={t('phone', { ns: 'general' })} value={organization.phone} readOnly />
          <FormInput
            label={t('address', { ns: 'general' })}
            value={organization.address}
            readOnly
          />
          <hr className="border-cool-gray-200" />
          <div className="flex flex-col gap-2">
            <h2>{t('description_title')}</h2>
            <p className="text-cool-gray-500">{t('description_placeholder')}</p>
          </div>
          <FormTextarea
            label={t('description', { ns: 'general' })}
            defaultValue={organization.description}
            readOnly
          />
        </div>
      </CardBody>
    </Card>
  );
};

export default OrganizationProfile;
