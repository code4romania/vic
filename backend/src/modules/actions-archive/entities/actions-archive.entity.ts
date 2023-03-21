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
  ActionsArchiveType,
  ActionsResourceType,
} from '../models/actions-archive.model';

@Entity({ name: 'actions_archive' })
export class ActionsArchiveEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', name: 'action', enum: ActionsArchiveType })
  action: ActionsArchiveType;

  @Column({ type: 'text', name: 'author_id' })
  authorId: string;

  @ManyToOne(() => AdminUserEntity)
  @JoinColumn({ name: 'author_id' })
  author: AdminUserEntity;

  @Column({ type: 'text', name: 'organization_id' })
  organizationId: string; //TODO: Create FK or remove and use the author to join with orgId?

  @Column({
    type: 'enum',
    name: 'resource_type',
    enum: ActionsResourceType,
  })
  resourceType: ActionsResourceType;

  @Column({ type: 'text', name: 'resource_id' })
  resourceId: string;

  // Column with differences
  @Column({ type: 'jsonb', name: 'diff', nullable: true })
  diff: unknown;
}
