import { IsOptional, IsString, MinLength } from 'class-validator';

export class GetCityDto {
  @IsString()
  @IsOptional()
  @MinLength(3)
  search: string;

  @IsString()
  @IsOptional()
  city: string;

  @IsString()
  @IsOptional()
  county: string;
}
