import { Transform } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { endOfDay } from 'date-fns';
import {
  BasePaginationFilterDto,
  SortableBy,
} from 'src/infrastructure/base/base-pagination-filter.dto';
import { EventFilterEnum } from 'src/modules/event/enums/event-filter.enum';

// A date with no time ("2026-11-20") as the end of the range means the whole day.
// Reads the raw query string: the global pipe's implicit conversion has already made it a Date.
const toEndDate = ({
  obj,
  key,
}: {
  obj: Record<string, string>;
  key: string;
}): Date | undefined => {
  const raw = obj[key];
  if (!raw) return undefined;
  return /^\d{4}-\d{2}-\d{2}$/.test(raw)
    ? endOfDay(new Date(`${raw}T00:00:00`))
    : new Date(raw);
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
  @Transform(({ obj }) =>
    obj.startFrom ? new Date(`${obj.startFrom}`) : undefined,
  )
  @IsDate()
  startFrom?: Date;

  @IsOptional()
  @Transform(toEndDate)
  @IsDate()
  startTo?: Date;
}
