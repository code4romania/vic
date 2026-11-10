import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import {
  BasePaginationFilterDto,
  SortableBy,
} from 'src/infrastructure/base/base-pagination-filter.dto';
import { EventState } from 'src/modules/event/enums/event-time.enum';

export class GetManyEventDto extends BasePaginationFilterDto {
  @SortableBy('name', 'startDate', 'endDate', 'status', 'createdOn')
  orderBy?: string;

  @IsEnum(EventState)
  @IsOptional()
  eventState?: EventState;

  // #494: events for this department (left out: all departments)
  @IsUUID()
  @IsOptional()
  departmentId?: string;
}
