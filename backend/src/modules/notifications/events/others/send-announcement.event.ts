import BaseEventMultipleUsers from '../base-event-multiple-users.class';

export default class SendAnnouncementEvent extends BaseEventMultipleUsers {
  constructor(
    _organizationId: string,
    _userIds: string[],
    _organizationName: string,
    _userEmails: string[],
    private _announcementId: string,
  ) {
    super(_organizationId, _userIds, _organizationName, _userEmails);
  }

  public get announcementId(): string {
    return this._announcementId;
  }
}
