export default class RejectHoursEvent {
  constructor(private _volunteerId: string, private _activityLogId: string) {}

  public get volunteerId(): string {
    return this._volunteerId;
  }

  public get activityLogId(): string {
    return this._activityLogId;
  }
}
