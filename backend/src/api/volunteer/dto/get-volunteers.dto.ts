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
  branch?: string;

  @IsString()
  @IsOptional()
  department?: string;

  @IsString()
  @IsOptional()
  role?: string;

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
