import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';
import {
  CreateActivityLogByAdminOptions,
  FindActivityLogCountOptions,
  FindManyActivityLogCounterOptions,
  FindManyActivityLogsOptions,
  IActivityLogCountHoursByStatus,
  IActivityLogListItemModel,
  IActivityLogModel,
  UpdateActivityLogOptions,
} from '../models/activity-log.model';

export interface IActivityLogRepository {
  create(newLog: CreateActivityLogByAdminOptions): Promise<IActivityLogModel>;
  find(id: string): Promise<IActivityLogModel>;
  findMany(
    findOptions: FindManyActivityLogsOptions,
  ): Promise<Pagination<IActivityLogListItemModel>>;
  update(
    id: string,
    updates: UpdateActivityLogOptions,
  ): Promise<IActivityLogModel>;
  countHourByStatus(
    findManyOptions: FindManyActivityLogCounterOptions,
  ): Promise<IActivityLogCountHoursByStatus>;
  countActivityLogs(findOptions: FindActivityLogCountOptions): Promise<number>;
}
