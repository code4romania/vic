import { EventStatus } from '../enums/event-status.enum';

export interface IEventDownload {
  Nume: string;
  'Data inceput': Date;
  'Data sfarsit'?: Date;
  Targets: string;
  'Numar participari': number;
  'Numar refuzuri': number;
  Status: EventStatus;
  'Ore raportate': number;
}
