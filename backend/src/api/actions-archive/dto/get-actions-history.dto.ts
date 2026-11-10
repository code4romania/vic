import { IsDate, IsOptional, IsString } from 'class-validator';
import {
  BasePaginationFilterDto,
  SortableBy,
} from 'src/infrastructure/base/base-pagination-filter.dto';

export class GetManyActionsArchiveDto extends BasePaginationFilterDto {
  @SortableBy('eventName', 'author.name', 'createdOn')
  orderBy?: string;

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
