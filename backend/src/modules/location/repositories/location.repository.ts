import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CityEntity } from '../entities/city.entity';
import { CountyEntity } from '../entities/county.entity';
import { ILocationRepository } from '../interfaces/location-repository.interface';
import {
  CityTransformer,
  FindLocationOptions,
  ICityModel,
} from '../model/city.model';
import { CountyTransformer, ICountyModel } from '../model/county.model';
import {
  Pagination,
  RepositoryWithPagination,
} from 'src/infrastructure/base/repository-with-pagination.class';
import { OrderDirection } from 'src/common/enums/order-direction.enum';

@Injectable()
export class LocationRepositoryService
  extends RepositoryWithPagination<CityEntity>
  implements ILocationRepository
{
  constructor(
    @InjectRepository(CityEntity)
    private readonly cityRepository: Repository<CityEntity>,
    @InjectRepository(CountyEntity)
    private readonly countyRepository: Repository<CountyEntity>,
  ) {
    super(cityRepository);
  }

  async findCounties(): Promise<ICountyModel[]> {
    const countyEntities = await this.countyRepository.find();
    return countyEntities.map(CountyTransformer.fromEntity);
  }

  async findCities(
    options: FindLocationOptions,
  ): Promise<Pagination<ICityModel>> {
    const { search, countyId } = options;

    const query = this.cityRepository
      .createQueryBuilder('city')
      .leftJoinAndMapOne('city.county', 'city.county', 'county')
      .select()
      .orderBy(
        this.buildOrderByQuery(options.orderBy || 'name', 'city'),
        options.orderDirection || OrderDirection.ASC,
      );

    if (search) {
      query.andWhere(this.buildBracketSearchQuery(['city.name'], search));
    }

    if (countyId) {
      query.andWhere('city.countyId = :countyId', { countyId });
    }

    return this.paginateQuery(
      query,
      options.limit,
      options.page,
      CityTransformer.fromEntity,
    );
  }

  async findCitiesByCountyId(countyId: number): Promise<ICityModel[]> {
    const cityEntities = await this.cityRepository.find({
      where: { countyId },
      relations: {
        county: true,
      },
    });
    return cityEntities.map(CityTransformer.fromEntity);
  }
}
