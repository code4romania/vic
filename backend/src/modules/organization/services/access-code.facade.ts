import { Injectable } from '@nestjs/common';
import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';
import {
  IAccessCodeModel,
  ICreateAccessCodeModel,
  IFindAccessCodeModel,
  IFindAllAccessCodeModel,
  IUpdateAccessCodeModel,
} from '../models/access-code.model';
import { AccessCodeRepositoryService } from '../repositories/access-code.repository';

@Injectable()
export class AccessCodeFacade {
  constructor(
    private readonly accessCodeRepository: AccessCodeRepositoryService,
  ) {}

  public async findAll(
    findOptions: IFindAllAccessCodeModel,
  ): Promise<Pagination<IAccessCodeModel>> {
    return this.accessCodeRepository.findMany(findOptions);
  }

  public async find(
    findOptions: IFindAccessCodeModel,
  ): Promise<IAccessCodeModel> {
    return this.accessCodeRepository.find(findOptions);
  }

  public async update(
    updateAccessCodeModel: IUpdateAccessCodeModel,
  ): Promise<IAccessCodeModel> {
    return this.accessCodeRepository.update(updateAccessCodeModel);
  }

  public async create(
    createAccessCodeModel: ICreateAccessCodeModel,
  ): Promise<IAccessCodeModel> {
    return this.accessCodeRepository.create(createAccessCodeModel);
  }

  public async delete(id: string): Promise<IAccessCodeModel> {
    return this.accessCodeRepository.delete(id);
  }
}
