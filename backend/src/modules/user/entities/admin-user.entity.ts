import { Exclude } from 'class-transformer';
import { BaseEntity } from 'src/infrastructure/base/base-entity';
import { OrganizationEntity } from 'src/modules/organization/entities/organization.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity({ name: 'admin_user' })
export class AdminUserEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Exclude()
  @Column({
    type: 'varchar',
    nullable: true,
    name: 'user_id',
  })
  userId: string;

  @OneToOne(() => UserEntity, { cascade: true })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Exclude()
  @Column({
    type: 'varchar',
    nullable: true,
    name: 'organization_id',
  })
  organizationId: string;

  @OneToOne(() => OrganizationEntity)
  @JoinColumn({ name: 'organization_id' })
  organization: OrganizationEntity;
}
