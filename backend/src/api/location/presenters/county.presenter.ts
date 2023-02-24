import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ICountyModel } from 'src/modules/location/model/county.model';

export class CountyPresenter {
  constructor(county: ICountyModel) {
    this.id = county.id;
    this.name = county.name;
    this.abbreviation = county.abbreviation;
  }

  @Expose()
  @ApiProperty({
    description: 'The county id',
    example: '1',
  })
  id: number;

  @Expose()
  @ApiProperty({
    description: 'The county name',
    example: 'Bucuresti',
  })
  name: string;

  @Expose()
  @ApiProperty({
    description: 'The county abbreviation',
    example: 'VS',
  })
  abbreviation: string;
}
