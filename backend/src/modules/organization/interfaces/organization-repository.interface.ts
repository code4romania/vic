import { ArrayOfPropetyType } from 'src/common/helpers/typescript-extends';
import {
  FindManyOrganizationsOptions,
  ICreateOrganizationModel,
  IFindOrganizationModel,
  IOrganizationModel,
  OrganizationUniqueFields,
  UpdateOrganizationOptions,
} from '../models/organization.model';
import { EntityManager } from 'typeorm';
import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';
import { OrganizationEntity } from '../entities/organization.entity';
import { IRepositoryWithPagination } from 'src/common/interfaces/repository-with-pagination.interface';
import { IOrganizationWithVolunteersModel } from '../models/organization-with-volunteers.model';
import { IOrganizationWithEventsModel } from '../models/organization-with-events.model';
import { IOrganizationVolunteerModel } from '../models/organization-volunteer.models';

export interface IOrganizationRepository
  extends IRepositoryWithPagination<OrganizationEntity> {
  create(
    organization: ICreateOrganizationModel,
    manager?: EntityManager,
  ): Promise<IOrganizationModel>;
  update(
    id: string,
    options: UpdateOrganizationOptions,
    manager?: EntityManager,
  ): Promise<IOrganizationModel>;
  findConflicts(
    fields: OrganizationUniqueFields,
    exceptId?: string,
  ): Promise<IOrganizationModel[]>;
  findPendingValidation(): Promise<IOrganizationModel[]>;
  find(
    options:
      | Partial<IFindOrganizationModel>
      | ArrayOfPropetyType<IFindOrganizationModel>,
  ): Promise<IOrganizationModel>;
  findWithEvents(
    organizationId: string,
    userId: string,
  ): Promise<IOrganizationWithEventsModel>;
  findMany(
    options: FindManyOrganizationsOptions,
  ): Promise<Pagination<IOrganizationWithVolunteersModel>>;
  findMyOrganizations(userId: string): Promise<IOrganizationVolunteerModel[]>;
  count(): Promise<number>;
}
