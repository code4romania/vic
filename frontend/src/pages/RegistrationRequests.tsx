import React, { useState } from 'react';
import PageLayout from '../layouts/PageLayout';
import Card from '../layouts/CardLayout';
import CardHeader from '../components/CardHeader';
import CardBody from '../components/CardBody';
import Button from '../components/Button';
import Tabs from '../components/Tabs';
import DataTableComponent from '../components/DataTableComponent';
import i18n from '../common/config/i18n';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { useRegistrationRequestsQuery } from '../services/registration-requests/RegistrationRequests.service';

export interface IAccessRequest {
  id: string;
  logo: string;
  name: string;
  email: string;
  phone: string;
  createdOn: string;
}

const RegistrationRequests = () => {
  const [filterStatus, setFilterStatus] = useState<'pending' | 'rejected'>('pending');

  const { data, isLoading } = useRegistrationRequestsQuery(filterStatus);

  const handleTabClick = (key: number) => {
    setFilterStatus('rejected');
    console.log(key);
  };

  return (
    <PageLayout>
      <h1>{i18n.t('registration_requests:title')}</h1>
      <Tabs
        tabs={[
          { value: i18n.t('registration_requests:options.requests'), key: 2 },
          { value: i18n.t('registration_requests:options.rejected_requests'), key: 3 },
        ]}
        onClick={handleTabClick}
      >
        <Card>
          <CardHeader>
            <div></div>
            <Button
              label={i18n.t('general:download_table')}
              icon={<ArrowDownTrayIcon className="h-5 w-5 text-cool-gray-600" />}
              className="btn-outline-secondary"
              onClick={() => alert('Not implemented')}
            />
          </CardHeader>
          <CardBody>{data && <DataTableComponent columns={data} loading={isLoading} />}</CardBody>
        </Card>
      </Tabs>
    </PageLayout>
  );
};

export default RegistrationRequests;
