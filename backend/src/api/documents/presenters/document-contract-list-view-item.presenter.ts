import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { DocumentContractStatus } from 'src/modules/documents/enums/contract-status.enum';
import { IDocumentContractListViewModel } from 'src/modules/documents/models/document-contract-list-view.model';

export class DocumentContractListViewItemPresenter {
  constructor(item: IDocumentContractListViewModel) {
    this.documentId = item.documentId;
    this.documentNumber = item.documentNumber;
    this.documentStartDate = item.documentStartDate;
    this.documentEndDate = item.documentEndDate;
    this.documentFilePath = item.documentFilePath;
    this.status = item.status;
    this.volunteerId = item.volunteerId;
    this.volunteerName = item.volunteerName;
    this.organizationId = item.organizationId;
    this.organizationName = item.organizationName;
  }

  @Expose()
  @ApiProperty({
    description: 'The uuid of the template',
    example: '525dcdf9-4117-443e-a0c3-bf652cdc5c1b',
  })
  documentId: string;

  @Expose()
  @ApiProperty({
    description: 'The document number',
    example: '123456',
  })
  documentNumber: string;

  @Expose()
  @ApiProperty({
    description: 'The document start date',
    example: '2021-01-01',
  })
  documentStartDate: Date;

  @Expose()
  @ApiProperty({
    description: 'The document end date',
    example: '2021-01-01',
  })
  documentEndDate: Date;

  @Expose()
  @ApiProperty({
    description: 'The document file path',
    example: 'https://example.com/document.pdf',
  })
  documentFilePath: string;

  @Expose()
  @ApiProperty({
    description: 'The document status',
    example: 'CREATED',
  })
  status: DocumentContractStatus;

  @Expose()
  @ApiProperty({
    description: 'The volunteer id',
    example: '525dcdf9-4117-443e-a0c3-bf652cdc5c1b',
  })
  volunteerId: string;

  @Expose()
  @ApiProperty({
    description: 'The volunteer name',
    example: 'John Doe',
  })
  volunteerName: string;

  @Expose()
  @ApiProperty({
    description: 'The organization id',
    example: '525dcdf9-4117-443e-a0c3-bf652cdc5c1b',
  })
  organizationId: string;

  @Expose()
  @ApiProperty({
    description: 'The organization name',
    example: 'John Doe',
  })
  organizationName: string;
}