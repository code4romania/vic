import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IActivityTypeModel } from 'src/modules/activity-type/models/activity-type.model';
import { ActivityTypeStatus } from 'src/modules/activity-type/enums/activity-type-status.enum';
import { IOrganizationStructureModel } from 'src/modules/organization/models/organization-structure.model';
import { OrganizationStructureType } from 'src/modules/organization/enums/organization-structure-type.enum';

class OrganizationStructureToActivityPresenter {
  @Expose()
  @ApiProperty({
    description: 'The uuid of the Organization Structure',
    example: '525dcdf9-4117-443e-a0c3-bf652cdc5c1b',
  })
  id: string;

  @Expose()
  @ApiProperty({
    description: 'The name of the Organization Structure',
    example: 'Financial',
  })
  name: string;

  @Expose()
  @ApiProperty({
    description: 'Type of the structure (branch/department/role)',
    enum: OrganizationStructureType,
    examples: Object.values(OrganizationStructureType),
  })
  type: OrganizationStructureType;

  static fromActivityType(
    structure: IOrganizationStructureModel,
  ): OrganizationStructureToActivityPresenter {
    if (!structure) return null;
    return {
      id: structure.id,
      name: structure.name,
      type: structure.type,
    };
  }
}

export class ActivityTypePresenter {
  constructor(activityType: IActivityTypeModel) {
    this.id = activityType.id;
    this.name = activityType.name;
    this.icon = activityType.icon;
    this.status = activityType.status;
    this.branch = OrganizationStructureToActivityPresenter.fromActivityType(
      activityType.branch,
    );
    this.department = OrganizationStructureToActivityPresenter.fromActivityType(
      activityType.department,
    );
    this.role = OrganizationStructureToActivityPresenter.fromActivityType(
      activityType.role,
    );
    this.createdOn = activityType.createdOn;
    this.updatedOn = activityType.updatedOn;
  }

  @Expose()
  @ApiProperty({
    description: 'The uuid of the Activity Type',
    example: '525dcdf9-4117-443e-a0c3-bf652cdc5c1b',
  })
  id: string;

  @Expose()
  @ApiProperty({ description: 'Name of the activity' })
  name: string;

  @Expose()
  @ApiProperty({ description: 'Icon' })
  icon: string;

  @Expose()
  @ApiProperty({
    description: 'The status',
    enum: ActivityTypeStatus,
    examples: Object.values(ActivityTypeStatus),
  })
  status: ActivityTypeStatus;

  @Expose()
  @ApiProperty({ type: OrganizationStructureToActivityPresenter })
  branch: OrganizationStructureToActivityPresenter;

  @Expose()
  @ApiProperty({ type: OrganizationStructureToActivityPresenter })
  department: OrganizationStructureToActivityPresenter;

  @Expose()
  @ApiProperty({ type: OrganizationStructureToActivityPresenter })
  role: OrganizationStructureToActivityPresenter;

  @Expose()
  @ApiProperty({ description: 'Date of creation' })
  createdOn: Date;

  @Expose()
  @ApiProperty({ description: 'Date of approval/rejection' })
  updatedOn: Date;
}
