import { BaseEntity } from 'src/infrastructure/base/base-entity';
import { OrganizationStructureEntity } from 'src/modules/organization/entities/organization-structure.entity';
import { OrganizationEntity } from 'src/modules/organization/entities/organization.entity';

import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { ActivityTypeStatus } from '../enums/activity-type-status.enum';

@Unique('name_organization', ['name', 'organization'])
@Entity({ name: 'activity_type' })
export class ActivityTypeEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', name: 'name' })
  name: string;

  @Column({ type: 'text', name: 'icon' })
  icon: string;

  @Column({ type: 'enum', enum: ActivityTypeStatus, name: 'status' })
  status: ActivityTypeStatus;

  @Column({
    type: 'varchar',
    nullable: true,
    name: 'branch_id',
  })
  branchId: string;

  @ManyToOne(() => OrganizationStructureEntity)
  @JoinColumn({ name: 'branch_id' })
  branch: OrganizationStructureEntity;

  @Column({
    type: 'varchar',
    nullable: true,
    name: 'department_id',
  })
  departmentId: string;

  @ManyToOne(() => OrganizationStructureEntity)
  @JoinColumn({ name: 'department_id' })
  department: OrganizationStructureEntity;

  @Column({
    type: 'varchar',
    nullable: true,
    name: 'role_id',
  })
  roleId: string;

  @ManyToOne(() => OrganizationStructureEntity)
  @JoinColumn({ name: 'role_id' })
  role: OrganizationStructureEntity;

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
