import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { CityEntity } from '../entities/city.entity';
import { CountyEntity } from '../entities/county.entity';
import { ILocationRepository } from '../interfaces/location-repository.interface';
import { CityTransformer, ICityModel } from '../model/city.model';
import { CountyTransformer, ICountyModel } from '../model/county.model';

@Injectable()
export class LocationRepositoryService implements ILocationRepository {
  constructor(
    @InjectRepository(CityEntity)
    private readonly cityRepository: Repository<CityEntity>,
    @InjectRepository(CountyEntity)
    private readonly countyRepository: Repository<CountyEntity>,
  ) {}

  async findCounties(): Promise<ICountyModel[]> {
    const countyEntities = await this.countyRepository.find();
    return countyEntities.map(CountyTransformer.fromEntity);
  }

  // This will only find the cities which start with the search word
  async findCities(searchWord: string): Promise<ICityModel[]> {
    const cityEntities = await this.cityRepository.find({
      where: { name: ILike(`${searchWord}%`) },
      relations: {
        county: true,
      },
    });
    return cityEntities.map(CityTransformer.fromEntity);
  }
}
