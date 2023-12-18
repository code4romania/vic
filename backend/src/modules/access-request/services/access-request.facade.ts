import { Injectable } from '@nestjs/common';
import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';
import {
  CreateAccessRequestModel,
  FindAccessRequestOptions,
  FindManyAccessRequestsOptions,
  IAccessRequestModel,
  UpdateAccessRequestModel,
} from '../model/access-request.model';
import { AccessRequestRepository } from '../repositories/access-request.repository';

@Injectable()
export class AccessRequestFacade {
  constructor(
    private readonly accessRequestRepository: AccessRequestRepository,
  ) {}

  async findMany(
    findOptions: FindManyAccessRequestsOptions,
  ): Promise<Pagination<IAccessRequestModel>> {
    return this.accessRequestRepository.findMany(findOptions);
  }

  async find(
    findOptions: FindAccessRequestOptions,
  ): Promise<IAccessRequestModel> {
    return this.accessRequestRepository.find(findOptions);
  }

  async update(
    updates: UpdateAccessRequestModel,
  ): Promise<IAccessRequestModel> {
    return this.accessRequestRepository.update(updates);
  }

  async create(
    newRequest: CreateAccessRequestModel,
  ): Promise<IAccessRequestModel> {
    return this.accessRequestRepository.create(newRequest);
  }

  async delete(id: string): Promise<string> {
    return this.accessRequestRepository.delete(id);
  }

  async deleteAllForUser(userId: string): Promise<void> {
    return this.accessRequestRepository.deleteAllForUser(userId);
  }
}
