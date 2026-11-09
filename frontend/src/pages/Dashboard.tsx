import React from 'react';
import PageLayout from '../layouts/PageLayout';
import PageHeader from '../components/PageHeader';
import DashboardStatistics from '../components/DashboardStatistics';
import DashboardUpcomingEvents from '../components/DashboardUpcomingEvents';
import DashboardAnnouncementResponses from '../components/DashboardAnnouncementResponses';

// VIC 2.0, #466 and #467: four counters, the next events and the latest announcement responses.
// The "Statistici voluntari organizație" and "Număr voluntari" charts are gone.
const Dashboard = () => {
  return (
    <PageLayout>
      <PageHeader>Dashboard</PageHeader>
      <div className="flex flex-col gap-6 md:gap-8">
        <DashboardStatistics />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-start">
          <DashboardUpcomingEvents />
          <DashboardAnnouncementResponses />
        </div>
      </div>
    </PageLayout>
  );
};

export default Dashboard;
