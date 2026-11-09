import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { BasePaginationFilterDto } from 'src/infrastructure/base/base-pagination-filter.dto';
import { EventRegistrationStatus } from 'src/modules/event/enums/event-registration-status.enum';

export class GetEventRegistrationsDto extends BasePaginationFilterDto {
  @IsOptional()
  @IsEnum(EventRegistrationStatus)
  status?: EventRegistrationStatus;

  @IsOptional()
  @IsUUID()
  eventId?: string;
}
