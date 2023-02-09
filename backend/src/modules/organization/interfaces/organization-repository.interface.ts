import { ArrayOfPropetyType } from 'src/common/helpers/typescript-extends';
import {
  ICreateOrganizationModel,
  IFindOrganizationModel,
  IOrganizationModel,
} from '../models/organization.model';

export interface IOrganizationRepository {
  create(organization: ICreateOrganizationModel): Promise<IOrganizationModel>;
  update(id: string, description: string): Promise<IOrganizationModel>;
  find(
    options:
      | Partial<IFindOrganizationModel>
      | ArrayOfPropetyType<IFindOrganizationModel>,
  ): Promise<IOrganizationModel>;
}
