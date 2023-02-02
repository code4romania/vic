import React, { useState } from 'react';
import Card from '../layouts/CardLayout';
import Button from './Button';
import CardHeader from './CardHeader';
import { PencilIcon } from '@heroicons/react/24/outline';
import CardBody from './CardBody';

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
  onSubmit: (description: string) => void;
}

const OrganizationProfile = ({ organization, onSubmit }: OrganizationProfileProps) => {
  const [readOnly, setReadOnly] = useState(true);

  return (
    <Card>
      <CardHeader>
        <h2>Profil organizatie</h2>
        <Button label={'Editeaza'} icon={<PencilIcon />} />
      </CardHeader>
      <CardBody>
        <form></form>
      </CardBody>
    </Card>
  );
};

export default OrganizationProfile;
