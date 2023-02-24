import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IOrganizationStructureModel } from 'src/modules/organization/models/organization-structure.model';

export class OrganizationStructureListItemPresenter {
  constructor(structure: IOrganizationStructureModel) {
    this.id = structure.id;
    this.name = structure.name;
  }

  @Expose()
  @ApiProperty({
    description: 'The uuid of the Organization Structure',
    example: '525dcdf9-4117-443e-a0c3-bf652cdc5c1b',
  })
  id: string;

  @Expose()
  @ApiProperty({
    description: 'The name of the Organization Structure',
    example: 'Financial',
  })
  name: string;
}
