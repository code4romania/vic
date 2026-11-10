import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import {
  BasePaginationFilterDto,
  SortableBy,
} from 'src/infrastructure/base/base-pagination-filter.dto';
import { EventRegistrationStatus } from 'src/modules/event/enums/event-registration-status.enum';

export class GetEventRegistrationsDto extends BasePaginationFilterDto {
  // Not sortable: any orderBy is a 400.
  @SortableBy()
  orderBy?: string;

  @IsOptional()
  @IsEnum(EventRegistrationStatus)
  status?: EventRegistrationStatus;

  @IsOptional()
  @IsUUID()
  eventId?: string;
}
