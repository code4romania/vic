import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CityEntity } from './entities/city.entity';
import { CountyEntity } from './entities/county.entity';
import { LocationRepositoryService } from './repositories/location.repository';
import { LocationFacade } from './services/location.facade';

@Module({
  imports: [TypeOrmModule.forFeature([CityEntity, CountyEntity])],
  providers: [LocationRepositoryService, LocationFacade],
  exports: [LocationFacade],
})
export class LocationModule {}
