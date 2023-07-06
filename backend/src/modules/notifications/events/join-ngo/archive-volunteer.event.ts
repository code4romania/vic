export default class ArchiveVolunteerEvent {
  constructor(
    private _organizationId: string,
    private _userId: string,
    private _organizationName: string,
    private _notificationsViaPush: boolean,
    private _notificationsViaEmail: boolean,
    private _userEmail: string,
  ) {}

  public get organizationId(): string {
    return this._organizationId;
  }

  public get userId(): string {
    return this._userId;
  }

  public get organizationName(): string {
    return this._organizationName;
  }

  public get notificationsViaPush(): boolean {
    return this._notificationsViaPush;
  }

  public get notificationsViaEmail(): boolean {
    return this._notificationsViaEmail;
  }

  public get userEmail(): string {
    return this._userEmail;
  }
}
