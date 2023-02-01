import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizationEntity } from '../entities/organization.entity';
import { IOrganizationRepository } from '../interfaces/organization-repository.interface';
import { IOrganizationModel } from '../models/organization.model';

@Injectable()
export class OrganizationRepositoryService implements IOrganizationRepository {
  constructor(
    @InjectRepository(OrganizationEntity)
    private readonly organizationRepository: Repository<OrganizationEntity>,
  ) {}

  // TODO: Database related operations
  create(organization: IOrganizationModel): Promise<IOrganizationModel> {
    throw new Error('Method not implemented.');
  }

  update(description: string): Promise<IOrganizationModel> {
    throw new Error('Method not implemented.');
  }

  findById(id: string): Promise<IOrganizationModel> {
    throw new Error('Method not implemented.');
  }

  findAll(): Promise<IOrganizationModel[]> {
    throw new Error('Method not implemented.');
  }
}
