import { MigrationInterface, QueryRunner } from 'typeorm';
import { COUNTIES } from './seed/counties.sees';
import { CITIES } from './seed/city.seed';
import { CountyEntity } from 'src/modules/location/entities/county.entity';
import { CityEntity } from 'src/modules/location/entities/city.entity';

export class LocationSeed1676988462013 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into(CountyEntity)
      .values(COUNTIES)
      .execute();

    await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into(CityEntity)
      .values(CITIES.slice(0, 5000))
      .execute();

    await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into(CityEntity)
      .values(CITIES.slice(5000, 10000))
      .execute();

    await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into(CityEntity)
      .values(CITIES.slice(10000))
      .execute();
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager
      .createQueryBuilder()
      .delete()
      .from(CityEntity)
      .execute();
    await queryRunner.manager
      .createQueryBuilder()
      .delete()
      .from(CountyEntity)
      .execute();
  }
}
