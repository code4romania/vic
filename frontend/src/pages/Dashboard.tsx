import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import CardBody from '../components/CardBody';
import CardHeader from '../components/CardHeader';
import Card from '../layouts/CardLayout';
import PageLayout from '../layouts/PageLayout';
import PageHeader from '../components/PageHeader';
import ActivityLogStatisticsCard from '../components/ActivityLogStatisticsCard';
import VolunteerStatisticsCard from '../components/VolunteerStatisticsCard';
import LineChartCard from '../components/LineChartCard';

const Dashboard = () => {
  // for testing purpose only

  return (
    <PageLayout>
      <PageHeader>Dashboard</PageHeader>
      <div className="flex gap-6 xl:gap-12 flex-col md:flex-row">
        <div className="flex gap-6 flex-wrap">
          <ActivityLogStatisticsCard />
          <VolunteerStatisticsCard />
        </div>
        <Card>
          <CardHeader>
            <h4>Test header</h4>
            <XMarkIcon className="h-6 w-6" />
          </CardHeader>
          <CardBody>
            <div>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Quidem eius quia
              necessitatibus voluptate mollitia blanditiis voluptatum modi corrupti natus numquam,
              expedita, tempore ex! Impedit omnis beatae, ducimus dolor at dolorem.
            </div>
          </CardBody>
        </Card>
      </div>
      <LineChartCard />
    </PageLayout>
  );
};

export default Dashboard;
