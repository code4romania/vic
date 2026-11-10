import { SEX } from 'src/modules/user/enums/user.enum';

export interface IAccessRequestDownload {
  Nume: string;
  'Data nașterii': Date;
  Sex: SEX;
  Email: string;
  Telefon: string;
  Locație: string;
  'Data creare cerere': Date;
  'Data refuz cerere'?: Date;
  'Motivul refuzului'?: string;
}
