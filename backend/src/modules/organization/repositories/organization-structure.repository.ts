import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderDirection } from 'src/common/enums/order-direction.enum';
import { IBasePaginationFilterModel } from 'src/infrastructure/base/base-pagination-filter.model';
import {
  Pagination,
  RepositoryWithPagination,
} from 'src/infrastructure/base/repository-with-pagination.class';
import { FindOptionsWhere, Repository } from 'typeorm';
import { OrganizationStructureEntity } from '../entities/organization-structure.entity';
import { OrganizationStructureType } from '../enums/organization-structure-type.enum';
import { IOrganizationStructureRepository } from '../interfaces/organization-structure-repository.interface';
import {
  ICreateOrganizationStructureModel,
  IFindAllOrganizationStructureModel,
  IFindOrganizationStructureModel,
  IOrganizationStructureModel,
  IUpdateOrganizationStructureModel,
  OrganizationStructureTransformer,
} from '../models/organization-structure.model';

@Injectable()
export class OrganizationStructureRepositoryService
  extends RepositoryWithPagination<OrganizationStructureEntity>
  implements IOrganizationStructureRepository
{
  constructor(
    @InjectRepository(OrganizationStructureEntity)
    private readonly structureRepository: Repository<OrganizationStructureEntity>,
  ) {
    super(structureRepository);
  }

  async create(
    newStructure: ICreateOrganizationStructureModel,
  ): Promise<IOrganizationStructureModel> {
    const structure = await this.structureRepository.save(
      OrganizationStructureTransformer.toEntity(newStructure),
    );

    return this.find({ id: structure.id });
  }

  async find(
    findOptions: IFindOrganizationStructureModel,
  ): Promise<IOrganizationStructureModel> {
    const structure = await this.structureRepository.findOne({
      where: findOptions,
      relations: {
        createdBy: true,
      },
    });

    return structure
      ? OrganizationStructureTransformer.fromEntity(structure)
      : null;
  }

  async findMany(
    findOptions: IFindAllOrganizationStructureModel,
  ): Promise<Pagination<IOrganizationStructureModel>> {
    const options: {
      filters: FindOptionsWhere<OrganizationStructureEntity>;
    } & IBasePaginationFilterModel = {
      ...findOptions,
      filters: {
        organizationId: findOptions.organizationId,
        type: findOptions.type,
      },
    };
    return this.findManyPaginated<IOrganizationStructureModel>(
      {
        searchableColumns: [],
        defaultSortBy: 'name',
        defaultOrderDirection: OrderDirection.ASC,
        relations: {
          createdBy: true,
        },
      },
      options,
      OrganizationStructureTransformer.fromEntity,
    );
  }

  async findAll(
    type: OrganizationStructureType,
    organizationId: string,
  ): Promise<IOrganizationStructureModel[]> {
    const structures = await this.structureRepository.find({
      where: { type, organizationId },
    });

    return structures.map(OrganizationStructureTransformer.fromEntity);
  }

  async update({
    id,
    ...updates
  }: IUpdateOrganizationStructureModel): Promise<IOrganizationStructureModel> {
    await this.structureRepository.update({ id }, { ...updates });

    return this.find({ id });
  }

  async delete(id: string): Promise<string> {
    const structure = await this.structureRepository.findOneBy({ id });

    if (structure) {
      await this.structureRepository.remove(structure);
      return id;
    }

    return null;
  }
}
