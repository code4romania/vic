import { Inject, Injectable } from '@nestjs/common';
import { IOrganizationRepository } from '../interfaces/organization-repository.interface';
import {
  FindManyOrganizationsOptions,
  ICreateOrganizationModel,
  IFindOrganizationModel,
  IOrganizationModel,
  OrganizationUniqueFields,
  UpdateOrganizationOptions,
} from '../models/organization.model';
import { EntityManager } from 'typeorm';
import { OrganizationRepositoryService } from '../repositories/organization.repository';
import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';
import { IOrganizationWithVolunteersModel } from '../models/organization-with-volunteers.model';
import { IOrganizationWithEventsModel } from '../models/organization-with-events.model';
import { IOrganizationVolunteerModel } from '../models/organization-volunteer.models';

@Injectable()
export class OrganizationFacadeService {
  constructor(
    @Inject(OrganizationRepositoryService)
    private readonly organizationRepository: IOrganizationRepository,
  ) {}

  public async findOrganization(
    options:
      | Partial<IFindOrganizationModel>
      | Partial<IFindOrganizationModel>[], // TODO move in model
  ): Promise<IOrganizationModel> {
    return this.organizationRepository.find(options);
  }

  public async updateOrganization(
    organizationId: string,
    options: UpdateOrganizationOptions,
    manager?: EntityManager,
  ): Promise<IOrganizationModel> {
    return this.organizationRepository.update(organizationId, options, manager);
  }

  public async createOrganization(
    organization: ICreateOrganizationModel,
    manager?: EntityManager,
  ): Promise<IOrganizationModel> {
    return this.organizationRepository.create(organization, manager);
  }

  public async findConflicts(
    fields: OrganizationUniqueFields,
    exceptId?: string,
  ): Promise<IOrganizationModel[]> {
    return this.organizationRepository.findConflicts(fields, exceptId);
  }

  public async findPendingValidation(): Promise<IOrganizationModel[]> {
    return this.organizationRepository.findPendingValidation();
  }

  public async findOrganizations(
    findOptions: FindManyOrganizationsOptions,
  ): Promise<Pagination<IOrganizationWithVolunteersModel>> {
    return this.organizationRepository.findMany(findOptions);
  }

  public async findOrganizationWithEvents(
    organizationId: string,
    userId: string,
  ): Promise<IOrganizationWithEventsModel> {
    return this.organizationRepository.findWithEvents(organizationId, userId);
  }

  public async findMyOrganizations(
    userId: string,
  ): Promise<IOrganizationVolunteerModel[]> {
    return this.organizationRepository.findMyOrganizations(userId);
  }

  public async countOrganizations(): Promise<number> {
    return this.organizationRepository.count();
  }
}
