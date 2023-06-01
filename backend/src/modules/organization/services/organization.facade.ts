import { Inject, Injectable } from '@nestjs/common';
import { IOrganizationRepository } from '../interfaces/organization-repository.interface';
import {
  FindManyOrganizationsOptions,
  ICreateOrganizationModel,
  IFindOrganizationModel,
  IOrganizationModel,
} from '../models/organization.model';
import { OrganizationRepositoryService } from '../repositories/organization.repository';
import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';
import { IOrganizationWithVolunteersModel } from '../models/organization-with-volunteers.model';
import { IOrganizationWithEventsModel } from '../models/organization-with-events.model';

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

  public async updateOrganizationDescription(
    organizationId: string,
    description: string,
  ): Promise<IOrganizationModel> {
    return this.organizationRepository.update(organizationId, description);
  }

  public async createOrganization(
    organization: ICreateOrganizationModel,
  ): Promise<IOrganizationModel> {
    return this.organizationRepository.create(organization);
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
  ): Promise<IOrganizationModel[]> {
    return this.organizationRepository.findMyOrganizations(userId);
  }
}
