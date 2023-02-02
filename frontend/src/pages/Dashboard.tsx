import React from 'react';
// import { XMarkIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
// import CardBody from '../components/CardBody';
// import CardHeader from '../components/CardHeader';
// import Card from '../layouts/CardLayout';
import PageLayout from '../layouts/PageLayout';
import { useTestValuesQuery } from '../services/test/test.service';
import OrganizationProfile from '../components/OrganizationProfile';

const Dashboard = () => {
  // for testing purpose only
  const { t } = useTranslation('general');
  // for testing purpos only
  const { data } = useTestValuesQuery();

  return (
    <PageLayout>
      This is the Dashboard
      <h1>Translation test {t('test')}</h1>
      <p>{JSON.stringify(data)}</p>
      <OrganizationProfile
        organization={{
          id: '1221312',
          logo: 'sdasdasd',
          email: 'contact@zen.ro',
          name: 'Asociatia ZEN',
          phone: '0721212121',
          description:
            'Descrierea organizației este afișată în profilul organizației din aplicația TEO. Poti alege sa formulezi o descriere specifica pentru aplicatia TEO, prin care sa atragi cat mai multi voluntari, sau sa folosesti descrierea organizatiei asa cum se regaseste in ONGHub. ',
          address: 'Str Galbena, nr 129, ap 20, Iași, jud Iași',
        }}
        onSubmit={(ceva) => console.log(ceva)}
      />
      {/* <Card>
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
      </Card> */}
    </PageLayout>
  );
};

export default Dashboard;
