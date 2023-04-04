export interface IActivityLogDownload {
  'Nume task': string;
  'Nume eveniment': string;
  'Numar ore': number;
  'Data participarii': Date;
  'Numele voluntarului': string;
  Mentiuni: string;
  'Inregistrata de': string;
  'Data inregistrarii': Date;
  'Aprobata de'?: string;
  'Respinsa de'?: string;
  'Data aprobarii'?: Date;
  'Data respingerii'?: Date;
  Status?: string;
}
