export interface IActivityLogItem {
  id: string;
  date: string;
  hours: number;
  activityTypeName: string;
  eventName?: string;
}
