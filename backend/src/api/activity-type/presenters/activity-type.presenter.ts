import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IActivityTypeModel } from 'src/modules/activity-type/models/activity-type.model';
import { ActivityTypeStatus } from 'src/modules/activity-type/enums/activity-type-status.enum';
import { OrganizationStructureListItemPresenter } from 'src/api/organization/presenters/organization-structure-list-item.presenter';

export class ActivityTypePresenter {
  constructor(activityType: IActivityTypeModel) {
    this.id = activityType.id;
    this.name = activityType.name;
    this.icon = activityType.icon;
    this.status = activityType.status;
    this.branch = activityType.branch
      ? new OrganizationStructureListItemPresenter(activityType.branch)
      : null;
    this.department = activityType.department
      ? new OrganizationStructureListItemPresenter(activityType.department)
      : null;
    this.role = activityType.role
      ? new OrganizationStructureListItemPresenter(activityType.role)
      : null;
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
  @ApiProperty({ type: OrganizationStructureListItemPresenter })
  branch: OrganizationStructureListItemPresenter;

  @Expose()
  @ApiProperty({ type: OrganizationStructureListItemPresenter })
  department: OrganizationStructureListItemPresenter;

  @Expose()
  @ApiProperty({ type: OrganizationStructureListItemPresenter })
  role: OrganizationStructureListItemPresenter;

  @Expose()
  @ApiProperty({ description: 'Date of creation' })
  createdOn: Date;

  @Expose()
  @ApiProperty({ description: 'Date of approval/rejection' })
  updatedOn: Date;
}
