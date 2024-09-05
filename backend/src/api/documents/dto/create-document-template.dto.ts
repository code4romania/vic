import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { IDocumentTemplateOrganizationData } from 'src/modules/documents/models/document-template.model';

class DocumentTemplateOrganizationDataDto
  implements IDocumentTemplateOrganizationData
{
  @IsString()
  @IsNotEmpty()
  officialName: string;

  @IsString()
  @IsNotEmpty()
  registeredOffice: string; // Sediu social

  @IsString()
  @IsNotEmpty()
  CUI: string;

  @IsString()
  @IsNotEmpty()
  legalRepresentativeName: string;

  @IsString()
  @IsNotEmpty()
  legalRepresentativeRole: string;
}

export class CreateDocumentTemplateDto {
  @IsString()
  @MaxLength(250)
  @MinLength(2)
  name: string;

  @IsObject()
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => DocumentTemplateOrganizationDataDto)
  organizationData: IDocumentTemplateOrganizationData;

  @IsString()
  @IsNotEmpty()
  documentTerms: string;
}
