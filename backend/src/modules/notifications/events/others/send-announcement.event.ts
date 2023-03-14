export default class SendAnnouncementEvent {
  constructor(
    private _organizationId: string,
    private _announcementId: string,
    private _targetIds: string[],
  ) {}

  public get organizationId(): string {
    return this._organizationId;
  }

  public get announcementId(): string {
    return this._announcementId;
  }

  public get targetIds(): string[] {
    return this._targetIds;
  }
}
