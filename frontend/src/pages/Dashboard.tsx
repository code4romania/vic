import React from 'react';
import PageLayout from '../layouts/PageLayout';
import PageHeader from '../components/PageHeader';
import DashboardStatistics from '../components/DashboardStatistics';
import DashboardUpcomingEvents from '../components/DashboardUpcomingEvents';
import DashboardAnnouncementResponses from '../components/DashboardAnnouncementResponses';
import DashboardQuickActions from '../components/DashboardQuickActions';
import DashboardPendingApprovals from '../components/DashboardPendingApprovals';
import i18n from '../common/config/i18n';

// VIC 2.0, #466 and #467: four counters, the next events and the latest announcement responses.
// The "Statistici voluntari organizație" and "Număr voluntari" charts are gone.
const Dashboard = () => {
  return (
    <PageLayout>
      <PageHeader subtitle={`${i18n.t('dashboard:subtitle')}`}>Dashboard</PageHeader>
      <div className="flex flex-col gap-6">
        <DashboardStatistics />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <DashboardUpcomingEvents />
          <DashboardAnnouncementResponses />
        </div>
        <DashboardQuickActions />
        <DashboardPendingApprovals />
      </div>
    </PageLayout>
  );
};

export default Dashboard;
