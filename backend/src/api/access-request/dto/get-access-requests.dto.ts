import {
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { BasePaginationFilterDto } from 'src/infrastructure/base/base-pagination-filter.dto';
import { AccessRequestStatus } from 'src/modules/access-request/enums/access-request-status.enum';

export class GetAccessRequestsDto extends BasePaginationFilterDto {
  @IsString()
  @IsOptional()
  @ValidateIf((v) => v.county !== undefined)
  city?: string;

  @IsString()
  @IsOptional()
  @ValidateIf((v) => v.city !== undefined)
  county?: string;

  @IsOptional()
  @IsDate()
  createdOnStart?: Date;

  @IsOptional()
  @IsDate()
  createdOnEnd?: Date;

  @IsOptional()
  @IsDate()
  rejectedOnStart?: Date;

  @IsOptional()
  @IsDate()
  rejectedOnEnd?: Date;

  @IsOptional()
  @IsEnum(AccessRequestStatus)
  status?: AccessRequestStatus;
}
