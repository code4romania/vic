import { IsEnum, IsOptional } from 'class-validator';
import {
  BasePaginationFilterDto,
  SortableBy,
} from 'src/infrastructure/base/base-pagination-filter.dto';
import { NewsType } from 'src/modules/actions-archive/enums/news-type.enum';

export class GetNewsDto extends BasePaginationFilterDto {
  @SortableBy('createdOn')
  orderBy?: string;

  @IsEnum(NewsType)
  @IsOptional()
  type: NewsType;
}
