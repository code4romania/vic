import BaseEvent from '../base-event.class';

export default class ArchiveVolunteerEvent extends BaseEvent {
  constructor(
    _organizationId: string,
    _userId: string,
    _organizationName: string,
    _notificationsViaPush: boolean,
    _notificationsViaEmail: boolean,
    _userEmail: string,
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
}
