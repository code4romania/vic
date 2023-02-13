import { Injectable } from '@nestjs/common';
import {
  CreateAccessRequestModel,
  FindAccessRequestModel,
  IAccessRequestModel,
  UpdateAccessRequestModel,
} from '../model/access-request.model';
import { AccessRequestRepository } from '../repositories/access-request.repository';

@Injectable()
export class AccessRequestFacade {
  constructor(
    private readonly accessRequestRepository: AccessRequestRepository,
  ) {}

  async find(
    findOptions: FindAccessRequestModel,
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
  async delete(id: string): Promise<IAccessRequestModel> {
    return this.accessRequestRepository.delete(id);
  }
}
