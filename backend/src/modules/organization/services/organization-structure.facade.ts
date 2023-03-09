import { Injectable } from '@nestjs/common';
import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';
import {
  ICreateOrganizationStructureModel,
  IFindAllOrganizationStructureByIds,
  IFindAllOrganizationStructureModel,
  IFindAllOrganizationStructurePaginatedModel,
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
    findOptions: IFindAllOrganizationStructurePaginatedModel,
  ): Promise<Pagination<IOrganizationStructureModel>> {
    return this.organizationStructureRepository.findMany(findOptions);
  }

  public async findAll(
    options: IFindAllOrganizationStructureModel,
  ): Promise<IOrganizationStructureModel[]> {
    return this.organizationStructureRepository.findAll(options);
  }

  async findAllByIds(
    options: IFindAllOrganizationStructureByIds,
  ): Promise<IOrganizationStructureModel[]> {
    return this.organizationStructureRepository.findAllByIds(options);
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

  public async exists(
    ids: string[],
    options: IFindOrganizationStructureModel,
  ): Promise<boolean> {
    return this.organizationStructureRepository.exists(ids, options);
  }
}
