import { IRepositoryWithPagination } from 'src/common/interfaces/repository-with-pagination.interface';
import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';
import { OrganizationStructureEntity } from '../entities/organization-structure.entity';
import { OrganizationStructureType } from '../enums/organization-structure-type.enum';
import {
  ICreateOrganizationStructureModel,
  IFindAllOrganizationStructureModel,
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
  findMany(
    options: IFindAllOrganizationStructureModel,
  ): Promise<Pagination<IOrganizationStructureModel>>;
  findAll(
    type: OrganizationStructureType,
    organizationId: string,
  ): Promise<IOrganizationStructureModel[]>;
}
