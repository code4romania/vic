import { IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateOrganizationStructureDto {
  @IsString()
  @MaxLength(50)
  @MinLength(2)
  name: string;
}
