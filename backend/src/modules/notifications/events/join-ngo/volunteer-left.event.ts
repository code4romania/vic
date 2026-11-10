import BaseEventMultipleUsers from '../base-event-multiple-users.class';

// #593: a volunteer left the organization; its active admins are told by email
export default class VolunteerLeftEvent extends BaseEventMultipleUsers {
  constructor(
    _organizationId: string,
    _userIds: string[],
    _organizationName: string,
    _userEmails: string[],
    private _volunteerName: string,
  ) {
    super(_organizationId, _userIds, _organizationName, _userEmails);
  }

  public get volunteerName(): string {
    return this._volunteerName;
  }
}
