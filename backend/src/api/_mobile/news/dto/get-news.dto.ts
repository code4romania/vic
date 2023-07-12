import { IsEnum, IsOptional } from 'class-validator';
import { BasePaginationFilterDto } from 'src/infrastructure/base/base-pagination-filter.dto';
import { NewsType } from 'src/modules/actions-archive/enums/news-type.enum';

export class GetNewsDto extends BasePaginationFilterDto {
  @IsEnum(NewsType)
  @IsOptional()
  type: NewsType;
}
