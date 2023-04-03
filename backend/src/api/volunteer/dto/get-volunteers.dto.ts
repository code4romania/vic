import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { AgeRangeEnum } from 'src/common/enums/age-range.enum';
import { BasePaginationFilterDto } from 'src/infrastructure/base/base-pagination-filter.dto';
import { VolunteerStatus } from 'src/modules/volunteer/enums/volunteer-status.enum';

export class GetVolunteersDto extends BasePaginationFilterDto {
  @IsEnum(VolunteerStatus)
  status: VolunteerStatus;

  @IsEnum(AgeRangeEnum)
  @IsOptional()
  age?: AgeRangeEnum;

  @IsString()
  @IsOptional()
  branchId?: string;

  @IsString()
  @IsOptional()
  departmentId?: string;

  @IsString()
  @IsOptional()
  roleId?: string;

  @IsNumber()
  @IsOptional()
  locationId?: number;

  @IsDate()
  @IsOptional()
  activeSinceStart?: Date;

  @IsDate()
  @IsOptional()
  activeSinceEnd?: Date;
}
