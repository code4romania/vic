import { IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateOrganizationStructureDto {
  @IsString()
  @MaxLength(20)
  @MinLength(2)
  name: string;
}
