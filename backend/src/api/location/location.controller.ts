import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { WebJwtAuthGuard } from 'src/modules/auth/guards/jwt-web.guard';
import { GetCitiesUseCase } from 'src/usecases/location/get-citties.usecase';
import { GetCountiesUseCase } from 'src/usecases/location/get-counties.usecase';
import { GetCityDto } from './dto/get-city.dto';
import { CityPresenter } from './presenters/city.presenter';
import { CountyPresenter } from './presenters/county.presenter';

@ApiBearerAuth()
@UseGuards(WebJwtAuthGuard)
@Controller('location')
export class LocationController {
  constructor(
    private readonly getCitiesUseCase: GetCitiesUseCase,
    private readonly getCountiesUseCase: GetCountiesUseCase,
  ) {}

  @Get('city')
  async getCities(@Query() { search }: GetCityDto): Promise<CityPresenter[]> {
    const cities = await this.getCitiesUseCase.execute(search);
    return cities.map((city) => new CityPresenter(city));
  }

  @Get('county')
  async getCounties(): Promise<CountyPresenter[]> {
    const counties = await this.getCountiesUseCase.execute();
    return counties.map((county) => new CountyPresenter(county));
  }
}
