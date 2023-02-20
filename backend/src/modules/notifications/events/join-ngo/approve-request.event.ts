export default class ApproveRequestEvent {
  constructor(private _volunteerId: string, private _organizationId: string) {}

  public get volunteerId(): string {
    return this._volunteerId;
  }

  public get organizationId(): string {
    return this._organizationId;
  }
}
