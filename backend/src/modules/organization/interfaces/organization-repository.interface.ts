import { IOrganizationModel } from '../models/organization.model';

export interface IOrganizationRepository {
  create(
    organization: Omit<IOrganizationModel, 'id'>,
  ): Promise<IOrganizationModel>;
  update(id: string, description: string): Promise<IOrganizationModel>;
  findById(id: string): Promise<IOrganizationModel>;
  findOneByOptions(
    options: Partial<Omit<IOrganizationModel, 'id'>>,
  ): Promise<IOrganizationModel>;
}
