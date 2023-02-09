import {
  ICreateOrganizationStructureModel,
  IFindAllOrganizationStructureModel,
  IOrganizationStructureModel,
  IUpdateOrganizationStructureModel,
} from '../models/organization-structure.model';

export interface IOrganizationStructureRepository {
  create(
    newStructure: ICreateOrganizationStructureModel,
  ): Promise<IOrganizationStructureModel>;
  findAll(
    findOptions: IFindAllOrganizationStructureModel,
  ): Promise<IOrganizationStructureModel[]>;
  update(
    updates: IUpdateOrganizationStructureModel,
  ): Promise<IOrganizationStructureModel>;
  delete(id: string): Promise<IOrganizationStructureModel>;
}
