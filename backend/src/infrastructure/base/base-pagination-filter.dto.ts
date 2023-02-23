import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { OrderDirection } from 'src/common/enums/order-direction.enum';

export class BasePaginationFilterDto {
  @IsNumber()
  @Type(() => Number)
  limit = 10;

  @IsNumber()
  @Type(() => Number)
  page = 1;

  @IsString()
  @IsOptional()
  search?: string;

  @IsOptional()
  @IsString()
  orderBy?: string;

  @IsOptional()
  @IsDate()
  start?: Date;

  @IsOptional()
  @IsDate()
  end?: Date;

  @IsOptional()
  @IsEnum(OrderDirection)
  orderDirection?: OrderDirection;
}
