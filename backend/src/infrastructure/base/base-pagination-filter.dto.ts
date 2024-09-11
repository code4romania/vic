import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { OrderDirection } from 'src/common/enums/order-direction.enum';
import { ApiProperty } from '@nestjs/swagger';

export class BasePaginationFilterDto {
  @ApiProperty({ default: 10 })
  @IsNumber()
  @Type(() => Number)
  limit: number = 10;

  @ApiProperty({ default: 1 })
  @IsNumber()
  @Type(() => Number)
  page: number = 1;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  orderBy?: string;

  @ApiProperty({ enum: OrderDirection, required: false })
  @IsOptional()
  @IsEnum(OrderDirection)
  orderDirection?: OrderDirection;
}
