export default class ArchiveVolunteerEvent {
  constructor(private _volunteerId: string) {}

  public get volunteerId(): string {
    return this._volunteerId;
  }
}
