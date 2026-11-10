import {
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
} from 'class-validator';
import { AgeRangeEnum } from 'src/common/enums/age-range.enum';
import {
  BasePaginationFilterDto,
  SortableBy,
} from 'src/infrastructure/base/base-pagination-filter.dto';
import { VolunteerStatus } from 'src/modules/volunteer/enums/volunteer-status.enum';

export class GetVolunteersDto extends BasePaginationFilterDto {
  @SortableBy(
    'user.name',
    'user.firstName',
    'volunteerProfile.email',
    'department.name',
    'status',
    'source',
    'createdOn',
  )
  orderBy?: string;

  // All statuses when left out (VIC 2.0 #476: one list with a status filter, no tabs).
  @IsEnum(VolunteerStatus)
  @IsOptional()
  status?: VolunteerStatus;

  // Volunteers who logged hours (pending or approved) on this activity type (#476).
  @IsUUID()
  @IsOptional()
  activityTypeId?: string;

  @IsEnum(AgeRangeEnum)
  @IsOptional()
  age?: AgeRangeEnum;

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
  @ValidateIf((v) => v.county !== undefined)
  city?: string;

  @IsString()
  @IsOptional()
  @ValidateIf((v) => v.city !== undefined)
  county?: string;

  @IsDate()
  @IsOptional()
  activeSinceStart?: Date;

  @IsDate()
  @IsOptional()
  activeSinceEnd?: Date;
}
