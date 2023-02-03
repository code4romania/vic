import React from 'react';
import Card from '../layouts/CardLayout';
import Button from './Button';
import CardHeader from './CardHeader';
import CardBody from './CardBody';
import FormInput from './FormInput';
import { PencilIcon } from '@heroicons/react/24/outline';
import PageLayout from '../layouts/PageLayout';

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
  return (
    <Card>
      <CardHeader>
        <h2>Profil organizatie</h2>
        <Button
          className="btn-outline-secondary"
          label={'Editeaza'}
          icon={<PencilIcon className="h-5 w-5 text-cool-gray-500" />}
          onClick={() => console.log('navigate')}
        />
      </CardHeader>
      <CardBody>
        <div className="h-fit w-full px-36 py-4">
          <PageLayout>
            <div className="flex flex-col gap-1">
              <h2>Profil organizatie</h2>
              <p className="text-cool-gray-500">Datele sunt preluate din ONGHub.</p>
            </div>
            <div className="flex flex-col gap-1">
              <p>Logo organizație</p>
              <img
                src="logo.svg"
                alt="Organization Logo"
                className="h-28 object-contain self-start p-2"
              />
            </div>
            <FormInput label="Denumire organizație" value={organization.name} readOnly />
            <FormInput label="Email" value={organization.email} readOnly />
            <FormInput label="Telefon" value={organization.phone} readOnly />
            <FormInput label="Adresa" value={organization.address} readOnly />
            <div className="h-[1px] min-w-full bg-cool-gray-200"></div>
            <div>ceva</div>
          </PageLayout>
        </div>
      </CardBody>
    </Card>
  );
};

export default OrganizationProfile;
