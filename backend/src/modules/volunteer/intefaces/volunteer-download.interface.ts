// Column headers of the volunteers export, in Romanian with diacritics (#593)
export interface IVolunteerDownload {
  Nume: string;
  'Data nașterii': Date;
  Locație: string;
  Email: string;
  Telefon: string;
  // the date the volunteer became active in the organization
  'Activ din': Date;
  'Nume filială'?: string;
  'Nume departament'?: string;
  'Nume rol'?: string;
  Ore: number;
  Status: string;
  Sursă: string;
  'Inactiv din'?: Date;
  'Data blocării'?: Date;
}
