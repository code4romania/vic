import BaseEvent from '../base-event.class';

export default class RejectHoursEvent extends BaseEvent {
  constructor(
    _organizationId: string,
    _userId: string,
    _organizationName: string,
    _notificationsViaPush: boolean,
    _notificationsViaEmail: boolean,
    _userEmail: string,
    private _activityLogId: string,
    private _hours: number,
    private _date: Date,
  ) {
    super(
      _organizationId,
      _userId,
      _organizationName,
      _notificationsViaPush,
      _notificationsViaEmail,
      _userEmail,
    );
  }

  public get activityLogId(): string {
    return this._activityLogId;
  }

  public get hours(): number {
    return this._hours;
  }

  public get date(): Date {
    return this._date;
  }
}
