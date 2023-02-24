import { BaseEntity, Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { CityEntity } from './city.entity';

@Entity({ name: '_county' })
export class CountyEntity extends BaseEntity {
  @PrimaryColumn()
  id: number;

  @Column({ type: 'text', name: 'name' })
  name: string;

  @Column({ type: 'text', name: 'abbreviation' })
  abbreviation: string;

  @OneToMany(() => CityEntity, (city) => city.county)
  cities: CityEntity[];
}
