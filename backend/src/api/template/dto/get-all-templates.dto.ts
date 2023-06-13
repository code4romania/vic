import { IsOptional, IsString } from 'class-validator';

export class GetAllTemplatesDto {
  @IsString()
  @IsOptional()
  search: string;
}
