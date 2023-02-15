import React from 'react';
import i18n from '../common/config/i18n';
import Card from '../layouts/CardLayout';
import Button from './Button';
import CardHeader from './CardHeader';
import CardBody from './CardBody';
import FormInput from './FormInput';
import { PencilIcon } from '@heroicons/react/24/outline';
import FormTextarea from './FormTextarea';
import { useNavigate } from 'react-router';
import FormLayout from '../layouts/FormLayout';
import Paragraph from './Paragraph';

export interface IOrganization {
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
  const navigate = useNavigate();

  const onEditButtonClick = () => {
    navigate('edit');
  };

  return (
    <Card>
      <CardHeader>
        <h2>{i18n.t('organization:title.view')}</h2>
        <Button
          className="btn-outline-secondary w-20"
          label={i18n.t('general:edit', { item: '' })}
          icon={<PencilIcon className="h-5 w-5 text-cool-gray-500" />}
          onClick={onEditButtonClick}
        />
      </CardHeader>
      <CardBody>
        <FormLayout>
          <Paragraph title={i18n.t('organization:title.view')}>
            {i18n.t('organization:subtitle')}
          </Paragraph>
          <div className="flex flex-col gap-1">
            <small className="text-cool-gray-500">{i18n.t('organization:logo')}</small>
            <img
              src={organization.logo || 'logo.svg'}
              alt="Organization Logo"
              className="h-28 object-contain self-start p-2"
            />
          </div>
          <FormInput label={i18n.t('organization:name')} value={organization.name} readOnly />
          <FormInput label={i18n.t('general:email')} value={organization.email} readOnly />
          <FormInput label={i18n.t('general:phone')} value={organization.phone} readOnly />
          <FormInput label={i18n.t('general:address')} value={organization.address} readOnly />
          <hr className="border-cool-gray-200" />
          <Paragraph title={i18n.t('organization:description')}>
            {i18n.t('organization:description_placeholder')}
          </Paragraph>
          <FormTextarea
            label={i18n.t('general:description')}
            defaultValue={organization.description}
            readOnly
          />
        </FormLayout>
      </CardBody>
    </Card>
  );
};

export default OrganizationProfile;
