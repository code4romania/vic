import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ICityModel } from 'src/modules/location/model/city.model';
import { CountyPresenter } from './county.presenter';

export class CityPresenter {
  constructor(city: ICityModel) {
    this.id = city.id;
    this.name = city.name;
    this.county = city.county;
  }

  @Expose()
  @ApiProperty({
    description: 'The city id',
    example: '1',
  })
  id: number;

  @Expose()
  @ApiProperty({
    description: 'The city name',
    example: 'Bucuresti',
  })
  name: string;

  @Expose()
  @ApiProperty({
    description: 'The county this city belongs to',
  })
  county: CountyPresenter;
}
