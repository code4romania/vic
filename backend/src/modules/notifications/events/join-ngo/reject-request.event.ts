import BaseEvent from '../base-event.class';

export default class RejectRequestEvent extends BaseEvent {
  constructor(
    _organizationId: string,
    _userId: string,
    _organizationName: string,
    _notificationsViaPush: boolean,
    _notificationsViaEmail: boolean,
    _userEmail: string,
    // #500: a rejection always has a reason, sent to the volunteer
    private _rejectionReason: string,
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

  public get rejectionReason(): string {
    return this._rejectionReason;
  }
}
