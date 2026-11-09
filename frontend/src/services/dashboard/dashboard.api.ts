import API from '../api';

// VIC 2.0, #466
export interface IDashboardOverview {
  activeVolunteers: number;
  pendingAccessRequests: number;
  upcomingEvents: number;
  pendingContracts: number;
  approvedHours: number;
  pendingHours: number;
}

// #467
export interface IDashboardUpcomingEvent {
  id: string;
  name: string;
  startDate: string;
  endDate: string | null;
  location: string | null;
  isPublic: boolean;
  going: number;
  capacity: number | null;
}

export interface IDashboardAnnouncementResponse {
  id: string;
  comment: string;
  createdOn: string;
  announcementId: string;
  announcementName: string;
  volunteerId: string | null;
  volunteerName: string;
}

export const getDashboardOverview = async (): Promise<IDashboardOverview> =>
  API.get('/dashboard/overview').then((res) => res.data);

export const getDashboardUpcomingEvents = async (): Promise<IDashboardUpcomingEvent[]> =>
  API.get('/dashboard/upcoming-events').then((res) => res.data);

export const getDashboardAnnouncementResponses = async (): Promise<
  IDashboardAnnouncementResponse[]
> => API.get('/dashboard/announcement-responses').then((res) => res.data);
