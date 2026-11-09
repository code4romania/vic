import BaseEventMultipleUsers from '../base-event-multiple-users.class';

// #496: the NGO registered these volunteers to an event (no acceptance needed in the app)
export default class VolunteerAddedToEventEvent extends BaseEventMultipleUsers {
  constructor(
    _organizationId: string,
    _userIds: string[],
    _organizationName: string,
    _userEmails: string[],
    private _eventId: string,
    private _eventName: string,
  ) {
    super(_organizationId, _userIds, _organizationName, _userEmails);
  }

  public get eventId(): string {
    return this._eventId;
  }

  public get eventName(): string {
    return this._eventName;
  }
}
