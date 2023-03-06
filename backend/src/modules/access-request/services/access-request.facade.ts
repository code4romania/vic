import { Injectable } from '@nestjs/common';
import { IAccessRequestDownload } from 'src/common/interfaces/access-request-download.interface';
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

  async getManyForDownload(
    findOptions: FindManyAccessRequestsOptions,
  ): Promise<IAccessRequestDownload[]> {
    return this.accessRequestRepository.getManyForDownload(findOptions);
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

  // TODO: check in usecase if the the "requestedBy + organizationId" is unique with status PENDING, otherwise error
  async create(
    newRequest: CreateAccessRequestModel,
  ): Promise<IAccessRequestModel> {
    return this.accessRequestRepository.create(newRequest);
  }

  // TODO: check in usecase if the status is "REJECTED" otherwise error
  async delete(id: string): Promise<string> {
    return this.accessRequestRepository.delete(id);
  }
}
