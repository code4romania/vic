import { Controller, Get, Param, Query } from '@nestjs/common';
import { GetCitiesUseCase } from 'src/usecases/location/get-citties.usecase';
import { GetCountiesUseCase } from 'src/usecases/location/get-counties.usecase';
import { GetCityDto } from './dto/get-city.dto';
import { CityPresenter } from './presenters/city.presenter';
import { CountyPresenter } from './presenters/county.presenter';
import { Public } from 'src/common/decorators/public.decorator';
import { ApiParam } from '@nestjs/swagger';
import { GetCitiesByCountyIdUseCase } from 'src/usecases/location/get-cities-by-county-id.usecase';
import { PaginatedPresenter } from 'src/infrastructure/presenters/generic-paginated.presenter';

@Public()
@Controller('location')
export class LocationController {
  constructor(
    private readonly getCitiesUseCase: GetCitiesUseCase,
    private readonly getCountiesUseCase: GetCountiesUseCase,
    private readonly getCitiesByCountyIdUseCase: GetCitiesByCountyIdUseCase,
  ) {}

  @Get('city')
  async getCities(
    @Query() options: GetCityDto,
  ): Promise<PaginatedPresenter<CityPresenter>> {
    const cities = await this.getCitiesUseCase.execute(options);

    return {
      items: cities.items.map((city) => new CityPresenter(city)),
      meta: cities.meta,
    };
  }

  @ApiParam({ name: 'countyId', type: 'number' })
  @Get('city/:countyId')
  async getCitiesByCountyId(
    @Param('countyId') countyId: number,
  ): Promise<CityPresenter[]> {
    const cities = await this.getCitiesByCountyIdUseCase.execute(countyId);
    return cities.map((city) => new CityPresenter(city));
  }

  @Get('county')
  async getCounties(): Promise<CountyPresenter[]> {
    const counties = await this.getCountiesUseCase.execute();
    return counties.map((county) => new CountyPresenter(county));
  }
}
