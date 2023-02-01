import { IOrganizationModel } from '../models/organization.model';

export interface IOrganizationRepository {
  create(organization: IOrganizationModel): Promise<IOrganizationModel>;
  update(description: string): Promise<IOrganizationModel>;
  findById(id: string): Promise<IOrganizationModel>;
  findAll(): Promise<IOrganizationModel[]>;
}
