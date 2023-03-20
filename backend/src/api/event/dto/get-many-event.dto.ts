import { IsEnum, IsOptional } from 'class-validator';
import { BasePaginationFilterDto } from 'src/infrastructure/base/base-pagination-filter.dto';
import { EventState } from 'src/modules/event/enums/event-time.enum';

export class GetManyEventDto extends BasePaginationFilterDto {
  @IsEnum(EventState)
  @IsOptional()
  eventState?: EventState;
}
