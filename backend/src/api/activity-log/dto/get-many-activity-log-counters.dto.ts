import { IsOptional, IsUUID } from 'class-validator';

export class GetManyActivityLogCountersDto {
  @IsUUID()
  @IsOptional()
  volunteerId?: string;
}
