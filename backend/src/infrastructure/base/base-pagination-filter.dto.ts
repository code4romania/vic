import { applyDecorators } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';
import { OrderDirection } from 'src/common/enums/order-direction.enum';

// A page holds at most this many items. The web asks for 50 at most and the app for 25; the Excel
// exports have their own routes and no page.
export const PAGINATION_MAX_LIMIT = 100;

// A column, or a relation's column: `name`, `user.name`. The sort column ends up in ORDER BY, so nothing
// else (quotes, spaces, parentheses, SQL) gets through. Each list narrows it further with @IsIn.
export const ORDER_BY_PATTERN =
  /^[A-Za-z_][A-Za-z0-9_]*(\.[A-Za-z_][A-Za-z0-9_]*)?$/;

// The columns a list may be sorted by: what its table offers, by the names the web and the app send.
// Anything else is a 400, so no other column (or SQL) reaches ORDER BY.
export const SortableBy = (
  ...columns: string[]
): PropertyDecorator & MethodDecorator =>
  applyDecorators(
    ApiPropertyOptional({ enum: columns }),
    IsOptional(),
    IsIn(columns),
  );

export class BasePaginationFilterDto {
  @IsNumber()
  @IsInt()
  @Min(1)
  @Max(PAGINATION_MAX_LIMIT)
  @Type(() => Number)
  limit = 10;

  @IsNumber()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page = 1;

  @IsString()
  @IsOptional()
  search?: string;

  // A list that sorts redeclares it with @IsIn(its columns); this is the floor for any that does not.
  @IsOptional()
  @IsString()
  @Matches(ORDER_BY_PATTERN)
  orderBy?: string;

  @IsOptional()
  @IsEnum(OrderDirection)
  orderDirection?: OrderDirection;
}
