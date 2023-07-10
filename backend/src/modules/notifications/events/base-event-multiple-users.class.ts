export default class BaseEventMultipleUsers {
  constructor(
    private _organizationId: string,
    private _userIds: string[],
    private _organizationName: string,
    private _userEmails: string[],
  ) {}

  public get organizationId(): string {
    return this._organizationId;
  }

  public get userIds(): string[] {
    return this._userIds;
  }

  public get organizationName(): string {
    return this._organizationName;
  }

  public get userEmails(): string[] {
    return this._userEmails;
  }
}
