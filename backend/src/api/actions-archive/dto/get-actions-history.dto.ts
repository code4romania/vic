import { IsDate, IsOptional, IsString } from 'class-validator';
import { BasePaginationFilterDto } from 'src/infrastructure/base/base-pagination-filter.dto';

export class GetManyActionsArchiveDto extends BasePaginationFilterDto {
  @IsString()
  @IsOptional()
  authorId?: string;

  @IsDate()
  @IsOptional()
  actionStartDate?: Date;

  @IsDate()
  @IsOptional()
  actionEndDate?: Date;
}
