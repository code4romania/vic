import { IRepositoryWithPagination } from 'src/common/interfaces/repository-with-pagination.interface';
import { OrganizationStructureEntity } from '../entities/organization-structure.entity';
import {
  ICreateOrganizationStructureModel,
  IOrganizationStructureModel,
  IUpdateOrganizationStructureModel,
} from '../models/organization-structure.model';

export interface IOrganizationStructureRepository
  extends IRepositoryWithPagination<OrganizationStructureEntity> {
  create(
    newStructure: ICreateOrganizationStructureModel,
  ): Promise<IOrganizationStructureModel>;
  update(
    updates: IUpdateOrganizationStructureModel,
  ): Promise<IOrganizationStructureModel>;
  delete(id: string): Promise<string>;
}
