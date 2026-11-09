import { useQuery } from 'react-query';
import {
  getDashboardAnnouncementResponses,
  getDashboardOverview,
  getDashboardUpcomingEvents,
} from './dashboard.api';

export const useDashboardOverviewQuery = () =>
  useQuery(['dashboard-overview'], getDashboardOverview);

export const useDashboardUpcomingEventsQuery = () =>
  useQuery(['dashboard-upcoming-events'], getDashboardUpcomingEvents);

export const useDashboardAnnouncementResponsesQuery = () =>
  useQuery(['dashboard-announcement-responses'], getDashboardAnnouncementResponses);
