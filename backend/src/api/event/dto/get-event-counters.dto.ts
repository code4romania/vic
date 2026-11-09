import { IsOptional, IsUUID } from 'class-validator';

export class GetEventCountersDto {
  // #494: the same department filter as the list
  @IsUUID()
  @IsOptional()
  departmentId?: string;
}
