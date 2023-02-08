import { Injectable } from '@nestjs/common';
import {
  ICreateOrganizationStructureModel,
  IFindAllOrganizationStructureModel,
  IFindOrganizationStructureModel,
  IOrganizationStructureModel,
  IUpdateOrganizationStructureModel,
} from '../models/organization-structure.model';
import { OrganizationStructureRepositoryService } from '../repositories/organization-structure.repository';

@Injectable()
export class OrganizationStructureFacade {
  constructor(
    private readonly organizationStructureRepository: OrganizationStructureRepositoryService,
  ) {}

  public async findAll(
    findOptions: IFindAllOrganizationStructureModel,
  ): Promise<IOrganizationStructureModel[]> {
    return this.organizationStructureRepository.findAll(findOptions);
  }

  public async find(
    findOptions: IFindOrganizationStructureModel,
  ): Promise<IOrganizationStructureModel> {
    return this.organizationStructureRepository.find(findOptions);
  }

  public async create(
    createModel: ICreateOrganizationStructureModel,
  ): Promise<IOrganizationStructureModel> {
    return this.organizationStructureRepository.create(createModel);
  }

  public async update(
    updateAccessCodeModel: IUpdateOrganizationStructureModel,
  ): Promise<IOrganizationStructureModel> {
    return this.organizationStructureRepository.update(updateAccessCodeModel);
  }

  public async delete(id: string): Promise<IOrganizationStructureModel> {
    return this.organizationStructureRepository.delete(id);
  }
}
