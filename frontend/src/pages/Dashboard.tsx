import React from 'react';
import PageLayout from '../layouts/PageLayout';
import PageHeader from '../components/PageHeader';
import ActivityLogStatisticsCard from '../components/ActivityLogStatisticsCard';
import VolunteerStatisticsCard from '../components/VolunteerStatisticsCard';
import LineChartCard from '../components/LineChartCard';
import PieChartCard from '../components/PieChartCard';

const Dashboard = () => {
  return (
    <PageLayout>
      <PageHeader>Dashboard</PageHeader>
      <div className="flex flex-col gap-y-6 md:gap-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-y-6 md:gap-y-8 lg:gap-8">
          <div className="flex flex-col sm:flex-row lg:flex-col gap-6 md:self-start">
            <ActivityLogStatisticsCard />
            <VolunteerStatisticsCard />
          </div>
          <div className="grow w-full lg:col-span-2 ">
            <PieChartCard />
          </div>
        </div>
        <LineChartCard />
      </div>
    </PageLayout>
  );
};

export default Dashboard;
