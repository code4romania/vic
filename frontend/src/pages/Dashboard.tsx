import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import CardBody from '../components/CardBody';
import CardHeader from '../components/CardHeader';
import Card from '../layouts/CardLayout';
import PageLayout from '../layouts/PageLayout';

const Dashboard = () => {
  // for testing purpose only
  const { t } = useTranslation('general');

  return (
    <PageLayout>
      This is the Dashboard
      <h1>Translation test {t('test')}</h1>
      <Card>
        <CardHeader>
          <h4>Test header</h4>
          <XMarkIcon className="h-6 w-6" />
        </CardHeader>
        <CardBody>
          <div>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quidem eius quia necessitatibus
            voluptate mollitia blanditiis voluptatum modi corrupti natus numquam, expedita, tempore
            ex! Impedit omnis beatae, ducimus dolor at dolorem.
          </div>
        </CardBody>
      </Card>
    </PageLayout>
  );
};

export default Dashboard;
