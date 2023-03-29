import React from 'react';
import PageLayout from '../layouts/PageLayout';
import PageHeader from '../components/PageHeader';
import ActivityLogStatisticsCard from '../components/ActivityLogStatisticsCard';
import VolunteerStatisticsCard from '../components/VolunteerStatisticsCard';
import LineChartCard from '../components/LineChartCard';
import PieChartCard from '../components/PieChartCard';

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
        {/* <PieChartCard /> */}
      </div>
      <LineChartCard />
      <PieChartCard />
    </PageLayout>
  );
};

export default Dashboard;
