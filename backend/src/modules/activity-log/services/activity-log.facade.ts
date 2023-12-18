import { Injectable } from '@nestjs/common';
import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';
import {
  CreateActivityLogOptions,
  FindActivityLogCountOptions,
  FindManyActivityLogCounterOptions,
  FindManyActivityLogsOptions,
  IActivityLogCountHoursByStatus,
  IActivityLogListItemModel,
  IActivityLogModel,
  UpdateActivityLogOptions,
} from '../models/activity-log.model';
import { ActivityLogRepositoryService } from '../repositories/activity-log.repository';

@Injectable()
export class ActivityLogFacade {
  constructor(
    private readonly activityLogRepository: ActivityLogRepositoryService,
  ) {}

  async create(newLog: CreateActivityLogOptions): Promise<IActivityLogModel> {
    return this.activityLogRepository.create(newLog);
  }

  async find(id: string): Promise<IActivityLogModel> {
    return this.activityLogRepository.find(id);
  }

  async findMany(
    findOptions: FindManyActivityLogsOptions,
  ): Promise<Pagination<IActivityLogListItemModel>> {
    return this.activityLogRepository.findMany(findOptions);
  }

  async update(
    id: string,
    updates: UpdateActivityLogOptions,
  ): Promise<IActivityLogModel> {
    return this.activityLogRepository.update(id, updates);
  }

  async countHoursByStatus(
    findManyOptions: FindManyActivityLogCounterOptions,
  ): Promise<IActivityLogCountHoursByStatus> {
    return this.activityLogRepository.countHourByStatus(findManyOptions);
  }

  async countActivityLogs(
    countOptions: FindActivityLogCountOptions,
  ): Promise<number> {
    return this.activityLogRepository.countActivityLogs(countOptions);
  }

  async delete(id: string): Promise<string> {
    return this.activityLogRepository.delete(id);
  }

  async deleteMany(ids: string[]): Promise<void> {
    return this.activityLogRepository.deleteMany(ids);
  }
}
