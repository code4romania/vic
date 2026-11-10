export interface IAnouncement {
  id: string;
  title: string;
  description: string;
  organizationLogo: string;
  // who posted it and when (sent by newer backends; older ones only have the logo)
  organization?: { id: string; name: string; logo?: string | null } | null;
  createdOn?: string | Date;
  publishedOn?: string | Date | null;
  // #504: the volunteer's answer; null when not answered yet
  myResponse?: { comment: string; createdOn: Date } | null;
}
