import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ICountyModel } from 'src/modules/location/model/county.model';

export class CountyPresenter {
  constructor(county: ICountyModel) {
    this.id = county.id;
    this.name = county.name;
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
}
