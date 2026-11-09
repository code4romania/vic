import BaseEvent from '../base-event.class';

// #501: the NGO approved or rejected the volunteer's registration to an event
export default class RegistrationDecidedEvent extends BaseEvent {
  constructor(
    _organizationId: string,
    _userId: string,
    _organizationName: string,
    _notificationsViaPush: boolean,
    _notificationsViaEmail: boolean,
    _userEmail: string,
    private _eventId: string,
    private _eventName: string,
    private _reason?: string,
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

  public get eventId(): string {
    return this._eventId;
  }

  public get eventName(): string {
    return this._eventName;
  }

  public get reason(): string {
    return this._reason;
  }
}
