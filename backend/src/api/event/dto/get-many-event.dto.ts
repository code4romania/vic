import { IsEnum } from 'class-validator';
import { BasePaginationFilterDto } from 'src/infrastructure/base/base-pagination-filter.dto';
import { EventTime } from 'src/modules/event/enums/event-time.enum';

export class GetManyEventDto extends BasePaginationFilterDto {
  @IsEnum(EventTime)
  eventTime: EventTime;
}
