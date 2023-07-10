import BaseEvent from '../base-event.class';

export default class ApproveRequestEvent extends BaseEvent {
  constructor(
    _organizationId: string,
    _userId: string,
    _organizationName: string,
    _notificationsViaPush: boolean,
    _notificationsViaEmail: boolean,
    _userEmail: string,
    private _volunteerId: string,
    private _logo: string,
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

  public get volunteerId(): string {
    return this._volunteerId;
  }

  public get logo(): string {
    return this._logo;
  }
}
