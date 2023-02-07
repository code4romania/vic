import {
  ICreateOrganizationModel,
  IOrganizationModel,
} from '../models/organization.model';

export interface IOrganizationRepository {
  create(organization: ICreateOrganizationModel): Promise<IOrganizationModel>;
  update(id: string, description: string): Promise<IOrganizationModel>;
  findById(id: string): Promise<IOrganizationModel>;
  findOneByOptions(
    options: Partial<ICreateOrganizationModel>,
  ): Promise<IOrganizationModel>;
}
