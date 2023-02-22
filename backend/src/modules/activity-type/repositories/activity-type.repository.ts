import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityTypeEntity } from '../entities/activity-type.entity';
import { IActivityTypeRepository } from '../interfaces/activity-type-repository.interface';
import {
  ActivityTypeTransformer,
  CreateActivityTypeOptions,
  FindActivityTypeOptions,
  FindManyActivityTypeOptions,
  IActivityTypeModel,
  UpdateActivityTypeOptions,
} from '../models/activity-type.model';

@Injectable()
export class ActivityTypeRepositoryService implements IActivityTypeRepository {
  constructor(
    @InjectRepository(ActivityTypeEntity)
    private readonly activityTypeRepository: Repository<ActivityTypeEntity>,
  ) {}

  async create(
    newActivityType: CreateActivityTypeOptions,
  ): Promise<IActivityTypeModel> {
    const activityType = await this.activityTypeRepository.save(
      ActivityTypeTransformer.toEntity(newActivityType),
    );

    return this.find({ id: activityType.id });
  }

  async update({
    id,
    ...updates
  }: UpdateActivityTypeOptions): Promise<IActivityTypeModel> {
    await this.activityTypeRepository.update({ id }, { ...updates });

    return this.find({ id });
  }

  async find(options: FindActivityTypeOptions): Promise<IActivityTypeModel> {
    const activityTypeEntity = await this.activityTypeRepository.findOne({
      where: options,
      relations: {
        organization: true,
        branch: true,
        department: true,
        role: true,
      },
    });

    return activityTypeEntity
      ? ActivityTypeTransformer.fromEntity(activityTypeEntity)
      : null;
  }

  async findAll(
    options: FindManyActivityTypeOptions,
  ): Promise<IActivityTypeModel[]> {
    const activityTypes = await this.activityTypeRepository.find({
      where: options,
      relations: {
        organization: true,
        branch: true,
        department: true,
        role: true,
      },
    });

    return activityTypes.map(ActivityTypeTransformer.fromEntity);
  }
}
