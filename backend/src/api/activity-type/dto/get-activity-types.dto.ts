import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ActivityTypeStatus } from 'src/modules/activity-type/enums/activity-type-status.enum';

export class GetActivityTypesDto {
  @IsString()
  @IsOptional()
  branch?: string;

  @IsString()
  @IsOptional()
  department?: string;

  @IsString()
  @IsOptional()
  role?: string;

  @IsString()
  @IsOptional()
  search?: string;

  @IsEnum(ActivityTypeStatus)
  @IsOptional()
  status?: ActivityTypeStatus;
}
