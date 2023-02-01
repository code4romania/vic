import { Inject, Injectable } from '@nestjs/common';
import { IOrganizationRepository } from '../interfaces/organization-repository.interface';
import { IOrganizationModel } from '../models/organization.model';
import { OrganizationRepositoryService } from '../repositories/organization-repository.service';

@Injectable()
export class OrganizationFacadeService {
  constructor(
    @Inject(OrganizationRepositoryService)
    private readonly organizationRepository: IOrganizationRepository,
  ) {}

  public async getOrganizationById(
    organizationId: string,
  ): Promise<IOrganizationModel> {
    return this.organizationRepository.findById(organizationId);
  }

  public async getOrganizationByOptions(
    options: Partial<Omit<IOrganizationModel, 'id'>>,
  ): Promise<IOrganizationModel> {
    return this.organizationRepository.findOneByOptions(options);
  }

  public async updateOrganizationDescription(
    organizationId: string,
    description: string,
  ): Promise<IOrganizationModel> {
    return this.organizationRepository.update(organizationId, description);
  }

  public async createOrganization(
    organization: Omit<IOrganizationModel, 'id'>,
  ): Promise<IOrganizationModel> {
    return this.organizationRepository.create(organization);
  }
}
