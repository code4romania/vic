import { OneOf } from 'src/common/helpers/typescript-extends';
import { IBaseModel } from 'src/common/interfaces/base.model';
import { IBasePaginationFilterModel } from 'src/infrastructure/base/base-pagination-filter.model';
import {
  ActivityTypeTransformer,
  IActivityTypeModel,
} from 'src/modules/activity-type/models/activity-type.model';
import {
  EventModelTransformer,
  IEventModel,
} from 'src/modules/event/models/event.model';
import { IOrganizationModel } from 'src/modules/organization/models/organization.model';
import {
  AdminUserTransformer,
  IAdminUserModel,
} from 'src/modules/user/models/admin-user.model';
import { IRegularUserModel } from 'src/modules/user/models/regular-user.model';
import {
  IVolunteerModel,
  VolunteerModelTransformer,
} from 'src/modules/volunteer/model/volunteer.model';
import { ActivityLogEntity } from '../entities/activity-log.entity';
import { ActivityLogResolutionStatus } from '../enums/activity-log-resolution-status.enum';
import {
  ActivityLogStatus,
  ActivityLogStatusForSolvedLogs,
} from '../enums/activity-log-status.enum';

export interface IActivityLogModel extends IBaseModel {
  id: string;

  date: Date;
  hours: number;
  mentions?: string;
  status: ActivityLogStatus;
  rejectionReason?: string;

  volunteer: IVolunteerModel;
  event?: IEventModel;
  activityType?: IActivityTypeModel;
  createdByAdmin?: IAdminUserModel; // In case is created by an Admin, will automatically be solved by the same admin

  approvedBy?: IAdminUserModel;
  approvedOn?: Date;

  rejectedBy?: IAdminUserModel;
  rejectedOn?: Date;

  organization: IOrganizationModel;
}

export interface IActivityLogListItemModel {
  id: string;
  hours: number;
  date: Date;
  status: ActivityLogStatus;
  createdOn: Date;
  // Relations
  volunteer: Pick<IVolunteerModel, 'id'> & Pick<IRegularUserModel, 'name'>;
  event?: Pick<IEventModel, 'id' | 'name'>;
  activityType: Pick<IActivityTypeModel, 'id' | 'name' | 'icon'>;
}

export interface IActivityLogDownloadModel {
  hours: number;
  date: Date;
  mentions: string;
  createdOn: Date;
  approvedOn: Date;
  status?: string;
  // Relations
  volunteer: Pick<IRegularUserModel, 'name'>;
  event?: Pick<IEventModel, 'name'>;
  activityType: Pick<IActivityTypeModel, 'name'>;
  createdByAdmin?: Pick<IAdminUserModel, 'name'>;
  approvedBy: Pick<IAdminUserModel, 'name'>;
}

export type IActivityLogCountHoursByStatus = {
  [ActivityLogStatus.PENDING]: number;
  [ActivityLogStatus.APPROVED]: number;
  [ActivityLogStatus.REJECTED]: number;
};

export type CreateActivityLogByAdminOptions = Pick<
  IActivityLogModel,
  'date' | 'hours' | 'mentions' | 'status' | 'approvedOn'
> & {
  volunteerId: string;
  organizationId: string;
  eventId?: string;
  activityTypeId?: string;
  createdByAdminId: string;
  approvedById: string;
};

type UpdateActivityLogDataOptions = Partial<
  Pick<
    CreateActivityLogByAdminOptions,
    'date' | 'hours' | 'eventId' | 'mentions' | 'activityTypeId'
  >
>;

type UpdateActivityLogStatusOptions = Pick<
  IActivityLogModel,
  'status' | 'approvedOn' | 'rejectedOn' | 'rejectionReason'
> & { approvedById: string; rejectedById: string };

export type UpdateActivityLogOptions = OneOf<
  [UpdateActivityLogDataOptions, UpdateActivityLogStatusOptions]
>;

export type FindManyActivityLogsOptions = {
  organizationId: string;
  resolutionStatus: ActivityLogResolutionStatus;

  eventId?: IActivityLogModel['event']['id'];
  volunteerId?: IActivityLogModel['volunteer']['id'];

  executionDateStart?: Date;
  executionDateEnd?: Date;

  registrationDateStart?: Date;
  registrationDateEnd?: Date;

  status?: ActivityLogStatusForSolvedLogs;

  approvedOrRejectedById?: string;
} & IBasePaginationFilterModel;

export type FindManyActivityLogsDownloadOptions = {
  organizationId: string;

  volunteerId?: string;

  executionDateStart?: Date;
  executionDateEnd?: Date;

  approvedOrRejectedById?: string;
} & Omit<IBasePaginationFilterModel, 'limit' | 'page'>;

export type FindManyActivityLogCounterOptions = {
  organizationId: string;
  volunteerId?: string;
};

export class ActivityLogModelTransformer {
  static fromEntityToListItem(
    entity: ActivityLogEntity,
  ): IActivityLogListItemModel {
    return {
      id: entity.id,
      hours: entity.hours,
      date: entity.date,
      status: entity.status,
      createdOn: entity.createdOn,
      volunteer: {
        id: entity.volunteer.id,
        name: entity.volunteer?.user?.name,
      },
      event: entity.event
        ? {
            id: entity.event.id,
            name: entity.event.name,
          }
        : null,
      activityType: entity.activityType
        ? {
            id: entity.activityType.id,
            name: entity.activityType.name,
            icon: entity.activityType.icon,
          }
        : null,
    };
  }

  static fromEntityToDownloadItem(
    entity: ActivityLogEntity,
  ): IActivityLogDownloadModel {
    return {
      hours: entity.hours,
      date: entity.date,
      mentions: entity.mentions,
      status: entity.status,
      approvedOn: entity.approvedOn,
      createdOn: entity.createdOn,
      volunteer: {
        name: entity.volunteer?.user?.name,
      },
      event: entity.event
        ? {
            name: entity.event.name,
          }
        : null,
      activityType: entity.activityType
        ? {
            name: entity.activityType.name,
          }
        : null,
      createdByAdmin: entity.createdByAdmin
        ? { name: entity.createdByAdmin.name }
        : null,
      approvedBy: entity.approvedBy ? { name: entity.approvedBy.name } : null,
    };
  }

  static fromEntity(entity: ActivityLogEntity): IActivityLogModel {
    return {
      id: entity.id,
      date: entity.date,
      hours: entity.hours,
      mentions: entity.mentions,
      status: entity.status,

      approvedBy: AdminUserTransformer.fromEntity(entity.approvedBy),
      approvedOn: entity.approvedOn,

      rejectedBy: AdminUserTransformer.fromEntity(entity.rejectedBy),
      rejectedOn: entity.rejectedOn,
      rejectionReason: entity.rejectionReason,

      volunteer: VolunteerModelTransformer.fromEntity(entity.volunteer),
      event: EventModelTransformer.fromEntity(entity.event),
      activityType: ActivityTypeTransformer.fromEntity(entity.activityType),
      createdByAdmin: AdminUserTransformer.fromEntity(entity.createdByAdmin),

      updatedOn: entity.updatedOn,
      createdOn: entity.createdOn,

      organization: entity.organization,
    };
  }

  static toEntity(newLog: CreateActivityLogByAdminOptions): ActivityLogEntity {
    const entity = new ActivityLogEntity();

    entity.date = newLog.date;
    entity.hours = newLog.hours;
    entity.mentions = newLog.mentions;
    entity.status = newLog.status;

    entity.approvedOn = newLog.approvedOn;
    entity.approvedById = newLog.approvedById;

    entity.createdByAdminId = newLog.createdByAdminId;

    entity.volunteerId = newLog.volunteerId;
    entity.eventId = newLog.eventId;
    entity.activityTypeId = newLog.activityTypeId;
    entity.organizationId = newLog.organizationId;

    return entity;
  }
}
