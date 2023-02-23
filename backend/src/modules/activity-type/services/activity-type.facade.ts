import { Injectable } from '@nestjs/common';
import { ActivityTypeStatus } from '../enums/activity-type-status.enum';
import {
  CreateActivityTypeOptions,
  FindActivityTypeOptions,
  FindManyActivityTypeOptions,
  IActivityTypeModel,
  UpdateActivityTypeDataOptions,
} from '../models/activity-type.model';
import { ActivityTypeRepositoryService } from '../repositories/activity-type.repository';

@Injectable()
export class ActivityTypeFacade {
  constructor(
    private readonly activityTypeRepository: ActivityTypeRepositoryService,
  ) {}

  public async create(
    newActivityType: CreateActivityTypeOptions,
  ): Promise<IActivityTypeModel> {
    return this.activityTypeRepository.create(newActivityType);
  }

  public async find(
    options: FindActivityTypeOptions,
  ): Promise<IActivityTypeModel> {
    return this.activityTypeRepository.find(options);
  }

  public async findAll(
    options: FindManyActivityTypeOptions,
  ): Promise<IActivityTypeModel[]> {
    return this.activityTypeRepository.findAll(options);
  }

  public async update(
    options: UpdateActivityTypeDataOptions,
  ): Promise<IActivityTypeModel> {
    return this.activityTypeRepository.update(options);
  }

  public async archive(id: string): Promise<IActivityTypeModel> {
    return this.activityTypeRepository.update({
      id,
      status: ActivityTypeStatus.ARCHIVED,
    });
  }

  public async activate(id: string): Promise<IActivityTypeModel> {
    return this.activityTypeRepository.update({
      id,
      status: ActivityTypeStatus.ACTIVE,
    });
  }
}
