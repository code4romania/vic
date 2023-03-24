import { AdminUserEntity } from 'src/modules/user/entities/user.entity';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {
  TrackedEventData,
  TrackedEventName,
} from '../enums/action-resource-types.enum';

@Entity({ name: 'actions_archive' })
export class ActionsArchiveEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', name: 'event_name', enum: TrackedEventName })
  eventName: TrackedEventName;

  @Column({ type: 'jsonb', name: 'event_data' })
  eventData: TrackedEventData[TrackedEventName];

  @Column({ type: 'jsonb', name: 'changes', nullable: true })
  changes: unknown;

  @Column({ type: 'text', name: 'author_id' })
  authorId: string;

  @ManyToOne(() => AdminUserEntity)
  @JoinColumn({ name: 'author_id' })
  author: AdminUserEntity;
}
