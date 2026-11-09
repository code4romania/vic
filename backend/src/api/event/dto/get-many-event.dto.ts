import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { BasePaginationFilterDto } from 'src/infrastructure/base/base-pagination-filter.dto';
import { EventState } from 'src/modules/event/enums/event-time.enum';

export class GetManyEventDto extends BasePaginationFilterDto {
  @IsEnum(EventState)
  @IsOptional()
  eventState?: EventState;

  // #494: events for this department (left out: all departments)
  @IsUUID()
  @IsOptional()
  departmentId?: string;
}
