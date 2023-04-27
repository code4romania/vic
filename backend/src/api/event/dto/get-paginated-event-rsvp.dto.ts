import { IsEnum, IsOptional, IsString } from 'class-validator';
import { RSVPGoingEnum } from 'src/modules/event/enums/rsvp-going.enum';
import { BasePaginationFilterDto } from 'src/infrastructure/base/base-pagination-filter.dto';

export class GetPaginatedEventRSVPsDto extends BasePaginationFilterDto {
  @IsOptional()
  @IsString()
  branch?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsEnum(RSVPGoingEnum)
  going?: RSVPGoingEnum;
}
