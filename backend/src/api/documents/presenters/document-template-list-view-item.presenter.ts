import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IDocumentTemplateListViewModel } from 'src/modules/documents/models/document-template-list-view.model';

export class DocumentTemplateListViewItemPresenter {
  constructor(item: IDocumentTemplateListViewModel) {
    this.id = item.id;
    this.name = item.name;
    this.usageCount = item.usageCount;
    this.lastUsage = item.lastUsage;
    this.createdById = item.createdById;
    this.createdByName = item.createdByName;
    this.createdOn = item.createdOn;
  }

  @Expose()
  @ApiProperty({
    description: 'The unique identifier of the document template',
    example: '525dcdf9-4117-443e-a0c3-bf652cdc5c1b',
  })
  id: string;

  @Expose()
  @ApiProperty({
    description: 'The name of the document template',
    example: 'Volunteer Agreement',
  })
  name: string;

  @Expose()
  @ApiProperty({
    description: 'The number of times this template has been used',
    example: 42,
  })
  usageCount: number;

  @Expose()
  @ApiProperty({
    description: 'The date when this template was last used',
    example: '2023-05-15T14:30:00Z',
  })
  lastUsage: Date | null;

  @Expose()
  @ApiProperty({
    description: 'The ID of the user who created this template',
    example: '8f7e9d3c-1a2b-3c4d-5e6f-7g8h9i0j1k2l',
  })
  createdById: string;

  @Expose()
  @ApiProperty({
    description: 'The name of the user who created this template',
    example: 'John Doe',
  })
  createdByName: string;

  @Expose()
  @ApiProperty({
    description: 'The date when this template was created',
    example: '2023-01-01T10:00:00Z',
  })
  createdOn: Date;
}
