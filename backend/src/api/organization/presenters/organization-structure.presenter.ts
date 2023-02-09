import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IOrganizationStructureModel } from 'src/modules/organization/models/organization-structure.model';
import { OrganizationStructureType } from 'src/modules/organization/enums/organization-structure-type.enum';

export class OrganizationStructurePresenter {
  constructor(structure: IOrganizationStructureModel) {
    this.id = structure.id;
    this.name = structure.name;
    this.type = structure.type;
    this.numberOfMembers = structure.members;
    this.createdBy = structure.createdBy;
    this.createdOn = structure.createdOn;
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

  @Expose()
  @ApiProperty({
    description: 'Type of the structure (branch/department/role)',
    enum: OrganizationStructureType,
    examples: Object.values(OrganizationStructureType),
  })
  type: OrganizationStructureType;

  @Expose()
  @ApiProperty({ description: 'How many members are in the structure' })
  numberOfMembers: number;

  @Expose()
  @ApiProperty({ description: 'Date of creation' })
  createdAt: Date;

  @Expose()
  @ApiProperty({ description: 'The Admin User who created the code' }) // TODO: how to annotate this properly?
  createdBy: { id: string; name: string };

  @Expose()
  @ApiProperty({ description: 'Date of creation' })
  createdOn: Date;
}
