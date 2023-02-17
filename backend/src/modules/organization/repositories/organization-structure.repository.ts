import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizationStructureEntity } from '../entities/organization-structure.entity';
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
  implements IOrganizationStructureRepository
{
  constructor(
    @InjectRepository(OrganizationStructureEntity)
    private readonly structureRepository: Repository<OrganizationStructureEntity>,
  ) {}

  async create(
    newStructure: ICreateOrganizationStructureModel,
  ): Promise<IOrganizationStructureModel> {
    const structure = await this.structureRepository.save(
      OrganizationStructureTransformer.toEntity(newStructure),
    );

    return this.find({ id: structure.id });
  }

  async findAll(
    findOptions: IFindAllOrganizationStructureModel /* INSERT FILTERING OPTIONS */,
  ): Promise<IOrganizationStructureModel[]> {
    const accessCodeEntities = await this.structureRepository.find({
      where: { ...findOptions },
      relations: {
        createdBy: true,
      },
    });

    return accessCodeEntities.map(OrganizationStructureTransformer.fromEntity);
  }

  async find(
    findOptions: IFindOrganizationStructureModel,
  ): Promise<IOrganizationStructureModel> {
    const structure = await this.structureRepository.findOne({
      where: { ...findOptions },
      relations: {
        createdBy: true,
      },
    });

    return structure
      ? OrganizationStructureTransformer.fromEntity(structure)
      : null;
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
