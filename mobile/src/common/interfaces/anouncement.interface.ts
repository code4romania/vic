export interface IAnouncement {
  id: string;
  title: string;
  description: string;
  organizationLogo: string;
  // #504: the volunteer's answer; null when not answered yet
  myResponse?: { comment: string; createdOn: Date } | null;
}
