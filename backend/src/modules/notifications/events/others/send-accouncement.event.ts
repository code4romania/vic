export default class SendAccouncementEvent {
  constructor(private _volunteerId: string, private _accouncementId: string) {}

  public get volunteerId(): string {
    return this._volunteerId;
  }

  public get accouncementId(): string {
    return this._accouncementId;
  }
}
