import BaseEvent from '../base-event.class';

export default class RejectContractEvent extends BaseEvent {
  constructor(
    _organizationId: string,
    _userId: string,
    _organizationName: string,
    _notificationsViaPush: boolean,
    _notificationsViaEmail: boolean,
    _userEmail: string,
    private _contractId: string,
    private _reason: string,
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

  public get contractId(): string {
    return this._contractId;
  }

  public get reason(): string {
    return this._reason;
  }
}
