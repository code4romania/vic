import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { CountyEntity } from './county.entity';

@Entity({ name: '_city' })
export class CityEntity extends BaseEntity {
  @PrimaryColumn()
  id: number;

  @Column({ type: 'text', name: 'name' })
  name: string;

  @Column({
    type: 'integer',
    nullable: true,
    name: 'county_id',
  })
  countyId: number;

  @ManyToOne(() => CountyEntity, (county) => county.cities, { cascade: true })
  @JoinColumn({ name: 'county_id' })
  @Index()
  county: CountyEntity;
}
