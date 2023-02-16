export default class AddNGOEventEvent {
  constructor(private _volunteerId: string, private _eventId: string) {}

  public get volunteerId(): string {
    return this._volunteerId;
  }

  public get eventId(): string {
    return this._eventId;
  }
}
