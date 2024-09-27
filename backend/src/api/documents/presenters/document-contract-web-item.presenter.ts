import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { DocumentContractComputedStatuses } from 'src/modules/documents/enums/contract-status.enum';
import { IDocumentContractWebItemModel } from 'src/modules/documents/models/document-contract-web-item.model';

export class DocumentContractWebItemPresenter {
  constructor(item: IDocumentContractWebItemModel) {
    this.documentId = item.documentId;
    this.documentNumber = item.documentNumber;
    this.documentStartDate = item.documentStartDate;
    this.documentEndDate = item.documentEndDate;
    this.documentFilePath = item.documentFilePath;
    this.status = item.status;
    this.volunteerId = item.volunteerId;
    this.volunteerName = item.volunteerName;
    this.organizationId = item.organizationId;
    this.createdByAdminId = item.createdByAdminId;
    this.createdByAdminName = item.createdByAdminName;

    this.documentTemplateId = item.documentTemplateId;
    this.documentTemplateName = item.documentTemplateName;

    this.rejectedById = item.rejectedById;
    this.rejectedByName = item.rejectedByName;
    this.rejectionDate = item.rejectionDate;
    this.rejectionReason = item.rejectionReason;
    this.createdOn = item.createdOn;
    this.updatedOn = item.updatedOn;
  }

  @Expose()
  @ApiProperty({
    description: 'The unique identifier of the document contract',
    example: '525dcdf9-4117-443e-a0c3-bf652cdc5c1b',
  })
  documentId: string;

  @Expose()
  @ApiProperty({
    description: 'The number of the document contract',
    example: '123456',
  })
  documentNumber: string;

  @Expose()
  @ApiProperty({
    description: 'The start date of the document contract',
    example: '2021-01-01',
  })
  documentStartDate: Date;

  @Expose()
  @ApiProperty({
    description: 'The end date of the document contract',
    example: '2021-01-01',
  })
  documentEndDate: Date;

  @Expose()
  @ApiProperty({
    description: 'The file path of the document contract',
    example: 'https://example.com/document.pdf',
  })
  documentFilePath: string;

  @Expose()
  @ApiProperty({
    description: 'The status of the document contract',
    enum: DocumentContractComputedStatuses,
  })
  status: DocumentContractComputedStatuses;

  @Expose()
  @ApiProperty({
    description: 'The unique identifier of the volunteer',
    example: '525dcdf9-4117-443e-a0c3-bf652cdc5c1b',
  })
  volunteerId: string;

  @Expose()
  @ApiProperty({
    description: 'The name of the volunteer',
    example: 'John Doe',
  })
  volunteerName: string;

  @Expose()
  @ApiProperty({
    description: 'The unique identifier of the organization',
    example: '525dcdf9-4117-443e-a0c3-bf652cdc5c1b',
  })
  organizationId: string;

  @Expose()
  @ApiProperty({
    description:
      'The unique identifier of the admin who created the document contract',
    example: '525dcdf9-4117-443e-a0c3-bf652cdc5c1b',
  })
  createdByAdminId: string;

  @Expose()
  @ApiProperty({
    description: 'The name of the admin who created the document contract',
    example: 'John Doe',
  })
  createdByAdminName: string;

  @Expose()
  @ApiProperty({
    description: 'The unique identifier of the document template',
    example: '525dcdf9-4117-443e-a0c3-bf652cdc5c1b',
  })
  documentTemplateId: string;

  @Expose()
  @ApiProperty({
    description: 'The name of the document template',
    example: 'Contract Template',
  })
  documentTemplateName: string;

  @Expose()
  @ApiProperty({
    description:
      'The unique identifier of the admin who rejected the document contract',
    example: '525dcdf9-4117-443e-a0c3-bf652cdc5c1b',
  })
  rejectedById: string;

  @Expose()
  @ApiProperty({
    description: 'The name of the admin who rejected the document contract',
    example: 'John Doe',
  })
  rejectedByName: string;

  @Expose()
  @ApiProperty({
    description: 'The date when the document contract was rejected',
    example: '2021-01-01',
  })
  rejectionDate: Date;

  @Expose()
  @ApiProperty({
    description: 'The reason for rejecting the document contract',
    example: 'The document contract was rejected',
  })
  rejectionReason: string;

  @Expose()
  @ApiProperty({
    description: 'The date when the document contract was created',
    example: '2021-01-01',
  })
  createdOn: Date;

  @Expose()
  @ApiProperty({
    description: 'The date when the document contract was updated',
    example: '2021-01-01',
  })
  updatedOn: Date;
}
