import { BaseEntity } from 'src/infrastructure/base/base-entity';
import {
  AdminUserEntity,
  RegularUserEntity,
} from 'src/modules/user/entities/user.entity';
import { EventRegistrationStatus } from '../enums/event-registration-status.enum';

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

  // #501: the NGO's decision on a "going" answer; null when not going
  @Column({
    type: 'enum',
    enum: EventRegistrationStatus,
    name: 'status',
    nullable: true,
  })
  status: EventRegistrationStatus;

  @Column({ type: 'text', name: 'rejection_reason', nullable: true })
  rejectionReason: string;

  @Column({ type: 'timestamptz', name: 'decided_on', nullable: true })
  decidedOn: Date;

  @Column({ type: 'uuid', name: 'decided_by', nullable: true })
  decidedById: string;

  @ManyToOne(() => AdminUserEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'decided_by' })
  decidedBy: AdminUserEntity;

  @Column({
    type: 'varchar',
    name: 'event_id',
  })
  eventId: string;

  @ManyToOne(() => EventEntity, {
    onDelete: 'CASCADE',
  })
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
