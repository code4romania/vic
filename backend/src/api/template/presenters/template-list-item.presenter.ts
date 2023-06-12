import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { ITemplateModel } from 'src/modules/documents/models/template.model';

export class TemplateListItemPresenter {
  constructor(template: ITemplateModel) {
    this.id = template.id;
    this.name = template.name;
    this.templateUses = 0;
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
    description:
      'The number of times the template has been used for a contract',
    example: '0',
  })
  templateUses: number;
}
