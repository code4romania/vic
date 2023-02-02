import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizationEntity } from '../entities/organization.entity';
import {
  toOrganizationEntity,
  toOrganizationModel,
} from '../helpers/organization.helper';
import { IOrganizationRepository } from '../interfaces/organization-repository.interface';
import { IOrganizationModel } from '../models/organization.model';

@Injectable()
export class OrganizationRepositoryService implements IOrganizationRepository {
  constructor(
    @InjectRepository(OrganizationEntity)
    private readonly organizationRepository: Repository<OrganizationEntity>,
  ) {}

  public async create(
    organization: Omit<IOrganizationModel, 'id'>,
  ): Promise<IOrganizationModel> {
    // create organization entity
    const newOrganizationEntity = toOrganizationEntity(organization);

    // save organization entity
    const organizationEntity = await this.organizationRepository.save(
      newOrganizationEntity,
    );

    // return organization model
    return toOrganizationModel(organizationEntity);
  }

  public async update(
    id: string,
    description: string,
  ): Promise<IOrganizationModel> {
    // update organization entity
    await this.organizationRepository.update({ id }, { description });

    // return organization model
    return this.findById(id);
  }

  public async findById(id: string): Promise<IOrganizationModel> {
    // get organization entity by id
    const organizationEntity = await this.organizationRepository.findOne({
      where: { id },
    });

    // return organization model
    return organizationEntity ? toOrganizationModel(organizationEntity) : null;
  }

  public async findOneByOptions(
    options: Partial<Omit<IOrganizationModel, 'id'>>,
  ): Promise<IOrganizationModel> {
    // get organization entity by id
    const organizationEntity = await this.organizationRepository.findOneBy(
      options,
    );

    // return organization model
    return organizationEntity ? toOrganizationModel(organizationEntity) : null;
  }
}
