export interface IVolunteerDownload {
  Nume: string;
  'Data nasterii': Date;
  Locatie: string;
  Email: string;
  Telefon: string;
  'Perioada activitate': Date;
  'Nume filiala'?: string;
  'Nume departament'?: string;
  'Nume rol'?: string;
  Ore: number;
  Status: string;
  Sursa: string;
  'Inactiv din'?: Date;
  'Data blocarii'?: Date;
}
