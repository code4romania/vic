import { BaseEntity } from 'src/infrastructure/base/base-entity';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import {
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
import { OrganizationEntity } from 'src/modules/organization/entities/organization.entity';

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

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'author_id' })
  author: UserEntity;

  @Column({ type: 'text', name: 'organization_id' })
  organizationId: string;

  @ManyToOne(() => OrganizationEntity)
  @JoinColumn({ name: 'organization_id' })
  organization: OrganizationEntity;
}
