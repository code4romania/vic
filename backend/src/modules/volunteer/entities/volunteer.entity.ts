import { BaseEntity } from 'src/infrastructure/base/base-entity';
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
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { VolunteerStatus } from '../enums/volunteer-status.enum';
import { VolunteerProfileEntity } from './volunteer-profile.entity';

// TODO: BR: Status Archived + ArchivedBy = null => volunteer leaved the org
@Unique('user_in_organization', ['user', 'organization']) // TODO: recheck
@Entity({ name: 'volunteer' })
export class VolunteerEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: VolunteerStatus,
    name: 'status',
    default: VolunteerStatus.ACTIVE,
  })
  status: VolunteerStatus;

  @Column({ type: 'timestamptz', name: 'archived_on', nullable: true })
  archivedOn: Date;

  @Column({ type: 'timestamptz', name: 'blocked_on', nullable: true })
  blockedOn: Date;

  @Column({ type: 'varchar', name: 'volunteer_profile_id', nullable: true })
  volunteerProfileId: string;

  // TODO: include acceessCodeId and accessRequestId?

  @OneToOne(() => VolunteerProfileEntity)
  @JoinColumn({ name: 'volunteer_profile_id' })
  volunteerProfile: VolunteerProfileEntity;

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

  @Column({ type: 'string', name: 'user_id' })
  userId: string;

  @ManyToOne(() => RegularUserEntity)
  @JoinColumn({ name: 'user_id' })
  user: RegularUserEntity;

  @Column({ type: 'varchar', name: 'organization_id' })
  organizationId: string;

  @ManyToOne(() => OrganizationEntity)
  @JoinColumn({ name: 'organization_id' })
  organization: OrganizationEntity;
}
