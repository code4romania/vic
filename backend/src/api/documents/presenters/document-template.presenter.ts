import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { AdminUserPresenter } from 'src/api/auth/presenters/admin-user.presenter';
import {
  IDocumentTemplateModel,
  IDocumentTemplateOrganizationData,
} from 'src/modules/documents/models/document-template.model';

export class DocumentTemplatePresenter {
  constructor(template: IDocumentTemplateModel) {
    this.id = template.id;
    this.name = template.name;
    this.organizationData = template.organizationData;
    this.documentTerms = template.documentTerms;
    this.createdByAdmin = template.createdByAdmin
      ? new AdminUserPresenter(template.createdByAdmin)
      : null;
  }

  @Expose()
  @ApiProperty({
    description: 'The uuid of the template',
    example: '525dcdf9-4117-443e-a0c3-bf652cdc5c1b',
  })
  id: string;

  @Expose()
  @ApiProperty({
    description: 'The name of the template',
    example: 'Template nou',
  })
  name: string;

  @Expose()
  @ApiProperty({
    description: 'The organization data of the template',
    example:
      '{  "officialName": "Official name",  "registeredOffice": "Registered office (👀 should it be composed?)",  "CUI": "RO42211332",  "legalRepresentativeName": "Legal representative\'s full name",  "legalRepresentativeRole": "Legal representative\'s role"}',
  })
  organizationData: IDocumentTemplateOrganizationData;

  @Expose()
  @ApiProperty({
    description: 'The document terms of the template',
    example: '<p> Some HTML content </p>',
  })
  documentTerms: string;

  @Expose()
  @ApiProperty({ description: 'Admin who created the template' })
  createdByAdmin: AdminUserPresenter;
}
