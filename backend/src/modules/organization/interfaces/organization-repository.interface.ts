import { ArrayOfPropetyType } from 'src/common/helpers/typescript-extends';
import {
  FindManyOrganizationsOptions,
  ICreateOrganizationModel,
  IFindOrganizationModel,
  IOrganizationModel,
} from '../models/organization.model';
import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';
import { OrganizationEntity } from '../entities/organization.entity';
import { IRepositoryWithPagination } from 'src/common/interfaces/repository-with-pagination.interface';

export interface IOrganizationRepository
  extends IRepositoryWithPagination<OrganizationEntity> {
  create(organization: ICreateOrganizationModel): Promise<IOrganizationModel>;
  update(id: string, description: string): Promise<IOrganizationModel>;
  find(
    options:
      | Partial<IFindOrganizationModel>
      | ArrayOfPropetyType<IFindOrganizationModel>,
  ): Promise<IOrganizationModel>;
  findMany(
    options: FindManyOrganizationsOptions,
  ): Promise<Pagination<IOrganizationModel>>;
}
