import { AdminUserEntity } from 'src/modules/user/entities/user.entity';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ActionsResourceType } from '../enums/action-resource-types.enum';
import { ActionsType } from '../enums/action-types.enum';

@Entity({ name: 'actions_archive' })
export class ActionsArchiveEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', name: 'action', enum: ActionsType })
  action: ActionsType;

  @Column({ type: 'text', name: 'author_id' })
  authorId: string;

  @ManyToOne(() => AdminUserEntity)
  @JoinColumn({ name: 'author_id' })
  author: AdminUserEntity;

  @Column({
    type: 'enum',
    name: 'resource_type',
    enum: ActionsResourceType,
  })
  resourceType: ActionsResourceType;

  @Column({ type: 'text', name: 'resource_id' })
  resourceId: string;

  @Column({ type: 'jsonb', name: 'diff', nullable: true })
  changes: unknown;
}
