import {
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
  ValidateIf,
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
