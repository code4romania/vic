import { Injectable } from '@nestjs/common';
import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';
import { OrganizationStructureType } from '../enums/organization-structure-type.enum';
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

  public async findMany(
    findOptions: IFindAllOrganizationStructureModel,
  ): Promise<Pagination<IOrganizationStructureModel>> {
    return this.organizationStructureRepository.findMany(findOptions);
  }

  public async findAll(
    type: OrganizationStructureType,
    organizationId: string,
  ): Promise<IOrganizationStructureModel[]> {
    return this.organizationStructureRepository.findAll(type, organizationId);
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

  public async delete(id: string): Promise<string> {
    return this.organizationStructureRepository.delete(id);
  }
}
