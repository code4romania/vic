import { BaseEntity } from 'src/infrastructure/base/base-entity';
import { RegularUserEntity } from 'src/modules/user/entities/user.entity';

import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { EventEntity } from './event.entity';

@Unique('user_in_event', ['user', 'event'])
@Entity({ name: 'event_rsvp' })
export class EventRSVPEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'boolean', name: 'going' })
  going: boolean;

  @Column({ type: 'text', name: 'mention', nullable: true })
  mention: string;

  @Column({
    type: 'varchar',
    name: 'event_id',
  })
  eventId: string;

  @ManyToOne(() => EventEntity)
  @JoinColumn({ name: 'event_id' })
  event: EventEntity;

  @Column({
    type: 'varchar',
    name: 'user_id',
  })
  userId: string;

  @ManyToOne(() => RegularUserEntity)
  @JoinColumn({ name: 'user_id' })
  user: RegularUserEntity;
}
