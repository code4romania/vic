import { SEX } from 'src/modules/user/enums/user.enum';

export interface IAccessRequestDownload {
  Nume: string;
  Varsta: number;
  Sex: SEX;
  Email: string;
  Telefon: string;
  Locatie: string;
  'Data creare cerere': string;
  'Data refuz cerere'?: string;
  'Motivul refuzului'?: string;
}
