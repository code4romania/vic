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
import { assertActivityLogAllowed } from '../activity-log-rules';
import { DataSource } from 'typeorm';

@Injectable()
export class ActivityLogFacade {
  constructor(
    private readonly activityLogRepository: ActivityLogRepositoryService,
    private readonly dataSource: DataSource,
  ) {}

  // M12: every new log follows the shared rules (activity-log-rules.ts)
  async create(newLog: CreateActivityLogOptions): Promise<IActivityLogModel> {
    await assertActivityLogAllowed(this.dataSource.manager, {
      volunteerId: newLog.volunteerId,
      date: newLog.date,
      hours: newLog.hours,
      eventId: newLog.eventId,
      activityTypeId: newLog.activityTypeId,
    });
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
    // M12: an edit of the hours, date, event or type follows the same rules, on the edited values
    const data = updates as {
      date?: Date;
      hours?: number;
      eventId?: string | null;
      activityTypeId?: string | null;
    };
    if (
      data.date !== undefined ||
      data.hours !== undefined ||
      data.eventId !== undefined ||
      data.activityTypeId !== undefined
    ) {
      const current = await this.activityLogRepository.find(id);
      if (current) {
        await assertActivityLogAllowed(this.dataSource.manager, {
          volunteerId: current.volunteer?.id,
          date: data.date ?? current.date,
          hours: data.hours ?? current.hours,
          eventId:
            data.eventId !== undefined ? data.eventId : current.event?.id,
          activityTypeId:
            data.activityTypeId !== undefined
              ? data.activityTypeId
              : current.activityType?.id,
          excludeId: id,
        });
      }
    }
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

  async deleteManyByVolunteerId(volunteerId: string): Promise<void> {
    return this.activityLogRepository.deleteManyByVolunteerId(volunteerId);
  }
}
