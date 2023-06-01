export interface IUserPersonalData {
  id: string;
  identityDocumentSeries: string;
  identityDocumentNumber: number;
  address: string;
  identityDocumentIssueDate: Date;
  identityDocumentExpirationDate: Date;
}

export interface IUserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  userPersonalData: IUserPersonalData;
}
