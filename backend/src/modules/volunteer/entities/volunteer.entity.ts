import { BaseEntity } from 'src/infrastructure/base/base-entity';
import { OrganizationStructureEntity } from 'src/modules/organization/entities/organization-structure.entity';
import { OrganizationEntity } from 'src/modules/organization/entities/organization.entity';
import {
  AdminUserEntity,
  RegularUserEntity,
} from 'src/modules/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { VolunteerStatus } from '../enums/volunteer-status.enum';

// TODO: BR: Status Archived + ArchivedBy = null => volunteer leaved the org

@Unique('user_per_organization', ['user', 'organization']) // TODO: recheck
@Entity({ name: 'volunteer' })
export class VolunteerEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', name: 'email' })
  email: string;

  @Column({ type: 'text', name: 'phone' })
  phone: string;

  @Column({
    type: 'enum',
    enum: VolunteerStatus,
    name: 'status',
  })
  status: VolunteerStatus;

  @Column({ type: 'timestamptz', name: 'active_since', default: new Date() })
  activeSince: Date;

  @Column({ type: 'timestamptz', name: 'archived_on' })
  archivedOn: Date;

  @Column({ type: 'timestamptz', name: 'blocked_on' })
  blockedOn: Date;

  @Column({ type: 'string', name: 'user_id' })
  userId: string;

  @ManyToOne(() => RegularUserEntity)
  @JoinColumn({ name: 'user_id' })
  user: RegularUserEntity;

  @Column({ type: 'string', name: 'archived_by', nullable: true })
  archivedById: string;

  @ManyToOne(() => AdminUserEntity)
  @JoinColumn({ name: 'archived_by' })
  archivedBy: AdminUserEntity;

  @Column({ type: 'string', name: 'blocked_by', nullable: true })
  blockedById: string;

  @ManyToOne(() => AdminUserEntity)
  @JoinColumn({ name: 'blocked_by' })
  blockedBy: AdminUserEntity;

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

  @Column({ type: 'varchar', name: 'organization_id' })
  organizationId: string;

  @ManyToOne(() => OrganizationEntity)
  @JoinColumn({ name: 'organization_id' })
  organization: OrganizationEntity;
}
