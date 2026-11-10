import { Transform } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, IsUUID } from 'class-validator';
import {
  endOfBucharestDay,
  startOfBucharestDay,
} from 'src/common/helpers/bucharest-time';
import {
  BasePaginationFilterDto,
  SortableBy,
} from 'src/infrastructure/base/base-pagination-filter.dto';
import { EventFilterEnum } from 'src/modules/event/enums/event-filter.enum';

// A date with no time ("2026-11-20") means that whole day in Romania: from its first moment
// (startFrom) to its last (startTo), whatever the server's zone. Reads the raw query string: the
// global pipe's implicit conversion has already made it a Date.
const DAY_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const toDate =
  (dayToInstant: (day: string) => Date) =>
  ({ obj, key }: { obj: Record<string, string>; key: string }): Date => {
    const raw = obj[key];
    if (!raw) return undefined;
    return DAY_ONLY.test(raw) ? dayToInstant(raw) : new Date(raw);
  };

export class GetMyEventsDto extends BasePaginationFilterDto {
  @SortableBy('startDate', 'name', 'createdOn')
  orderBy?: string;

  @IsEnum(EventFilterEnum)
  @IsOptional()
  eventFilter: EventFilterEnum;

  // Redesigned mobile search: Organizație / Când filters
  @IsOptional()
  @IsUUID()
  organizationId?: string;

  @IsOptional()
  @Transform(toDate(startOfBucharestDay))
  @IsDate()
  startFrom?: Date;

  @IsOptional()
  @Transform(toDate(endOfBucharestDay))
  @IsDate()
  startTo?: Date;
}
