import { PickType } from '@nestjs/swagger';
import { GetMyEventsDto } from './get-my-events.dto';

// The segment badges take the list's search and filters, with no segment and no paging
export class GetMyEventsCountsDto extends PickType(GetMyEventsDto, [
  'search',
  'organizationId',
  'startFrom',
  'startTo',
] as const) {}
