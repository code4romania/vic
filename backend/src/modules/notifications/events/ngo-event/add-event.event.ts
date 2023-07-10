import BaseEventMultipleUsers from '../base-event-multiple-users.class';

export default class AddNGOEventEvent extends BaseEventMultipleUsers {
  constructor(
    _organizationId: string,
    _userIds: string[],
    _organizationName: string,
    _userEmails: string[],
    private _eventId: string,
  ) {
    super(_organizationId, _userIds, _organizationName, _userEmails);
  }

  public get eventId(): string {
    return this._eventId;
  }
}
