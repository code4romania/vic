import { IOrganization } from './organization.interface';
import { IUser } from './user.interface';

export interface ITemplate {
  id: string;
  name: string;
  path: string;
}

export interface IDocumentTemplateListItem {
  id: string;
  name: string;
  usageCount: string;
  lastUsage: string;
  createdById: string;
  createdByName: string;
  createdOn: string;
}

export interface IOrganizationData {
  officialName: string;
  registeredOffice: string;
  CUI: string;
  legalRepresentativeName: string;
  legalRepresentativeRole: string;
}

export interface IDocumentTemplate {
  id: string;
  name: string;
  documentTerms: string; // HTML
  createdByAdmin: Pick<IUser, 'id' | 'name'>;
  organizationData: IOrganizationData;
}
