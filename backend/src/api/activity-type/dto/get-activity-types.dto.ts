import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ActivityTypeStatus } from 'src/modules/activity-type/enums/activity-type-status.enum';

export class GetActivityTypesDto {
  @IsString()
  @IsOptional()
  branchId?: string;

  @IsString()
  @IsOptional()
  departmentId?: string;

  @IsString()
  @IsOptional()
  roleId?: string;

  @IsString()
  @IsOptional()
  search?: string;

  @IsEnum(ActivityTypeStatus)
  @IsOptional()
  status?: ActivityTypeStatus;
}
