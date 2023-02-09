import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizationEntity } from '../entities/organization.entity';
import { IOrganizationRepository } from '../interfaces/organization-repository.interface';
import {
  ICreateOrganizationModel,
  IFindOrganizationModel,
  IOrganizationModel,
  OrganizationTransformer,
} from '../models/organization.model';

@Injectable()
export class OrganizationRepositoryService implements IOrganizationRepository {
  constructor(
    @InjectRepository(OrganizationEntity)
    private readonly organizationRepository: Repository<OrganizationEntity>,
  ) {}

  public async create(
    organization: ICreateOrganizationModel,
  ): Promise<IOrganizationModel> {
    // create organization entity
    const newOrganizationEntity =
      OrganizationTransformer.toEntity(organization);

    // save organization entity
    const organizationEntity = await this.organizationRepository.save(
      newOrganizationEntity,
    );

    // return organization model
    return OrganizationTransformer.fromEntity(organizationEntity);
  }

  public async update(
    id: string,
    description: string,
  ): Promise<IOrganizationModel> {
    // update organization entity
    await this.organizationRepository.update({ id }, { description });

    // return organization model
    return this.find({ id });
  }

  public async find(
    options: Partial<IFindOrganizationModel>,
  ): Promise<IOrganizationModel> {
    // get organization entity by id
    const organizationEntity = await this.organizationRepository.findOne({
      where: options,
    });

    // return organization model
    return organizationEntity
      ? OrganizationTransformer.fromEntity(organizationEntity)
      : null;
  }
}
