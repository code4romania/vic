export interface IAction {
  id: string;
  author: { id: string; name: string };
  eventName: string;
  eventData: object;
  changes: object;
  createdOn: Date;
}
