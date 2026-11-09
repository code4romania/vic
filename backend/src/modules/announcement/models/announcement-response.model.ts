// VIC 2.0 (#504): volunteers' answers to announcements
export interface IAnnouncementResponseModel {
  id: string;
  announcementId: string;
  comment: string;
  createdOn: Date;
  user: { id: string; name: string; email: string };
  volunteerId?: string;
}

export type CreateAnnouncementResponseOptions = {
  announcementId: string;
  userId: string;
  volunteerId: string;
  comment: string;
};

export type FindManyAnnouncementResponsesOptions = {
  announcementId: string;
  limit: number;
  page: number;
};
