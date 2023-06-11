import { IsEnum, IsOptional } from 'class-validator';
import { BasePaginationFilterDto } from 'src/infrastructure/base/base-pagination-filter.dto';
import { EventFilterEnum } from 'src/modules/event/enums/event-filter.enum';

export class GetMyEventsDto extends BasePaginationFilterDto {
  @IsEnum(EventFilterEnum)
  @IsOptional()
  eventFilter: EventFilterEnum;
}
