import { Exclude } from 'class-transformer';
import { BaseEntity } from 'src/infrastructure/base/base-entity';
import { AdminUserEntity } from 'src/modules/user/entities/admin-user.entity';

import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { OrganizationEntity } from './organization.entity';

@Unique('codeOrg', ['code', 'organization'])
@Entity({ name: 'access_code' })
export class AccessCodeEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', name: 'code' })
  code: string;

  @Column({ type: 'timestamptz', name: 'start_date' })
  startDate: Date;

  @Column({ type: 'timestamptz', name: 'end_date', nullable: true })
  endDate?: Date;

  @Column({ type: 'integer', name: 'usage_count', default: 0 })
  usageCount: number;

  @Column({ type: 'string', name: 'created_by' })
  createdBy: string;

  @ManyToOne(() => AdminUserEntity)
  @JoinColumn({ name: 'created_by' })
  adminUser: AdminUserEntity;

  @Exclude()
  @Column({
    type: 'varchar',
    nullable: true,
    name: 'organization_id',
  })
  organizationId: string;

  @ManyToOne(() => OrganizationEntity)
  @JoinColumn({ name: 'organization_id' })
  organization: OrganizationEntity;
}
