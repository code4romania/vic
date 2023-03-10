import { SEX } from 'src/modules/user/enums/user.enum';

export interface IAccessRequestDownload {
  Nume: string;
  'Data nasterii': Date;
  Sex: SEX;
  Email: string;
  Telefon: string;
  Locatie: string;
  'Data creare cerere': Date;
  'Data refuz cerere'?: Date;
  'Motivul refuzului'?: string;
}
