import { IsEnum, IsString, MaxLength, MinLength } from 'class-validator';
import { OrganizationStructureType } from 'src/modules/organization/enums/organization-structure-type.enum';

export class CreateOrganizationStructureDto {
  @IsString()
  @MaxLength(20)
  @MinLength(2)
  name: string;

  @IsEnum(OrganizationStructureType)
  type: OrganizationStructureType;
}
