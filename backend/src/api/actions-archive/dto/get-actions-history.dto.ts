import { IsDate, IsOptional, IsString } from 'class-validator';
import { BasePaginationFilterDto } from 'src/infrastructure/base/base-pagination-filter.dto';

export class GetManyActionsArchiveDto extends BasePaginationFilterDto {
  @IsString()
  @IsOptional()
  author?: string;

  @IsDate()
  @IsOptional()
  actionStartDate?: Date;

  @IsDate()
  @IsOptional()
  actionEndDate?: Date;

  @IsString()
  @IsOptional()
  volunteerId?: string;
}
