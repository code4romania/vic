export interface IAccessCode {
  id: string;
  code: string;
  availabilityStart: Date;
  availabilityEnd?: Date;
}
