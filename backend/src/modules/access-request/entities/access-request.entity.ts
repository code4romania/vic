import { Exclude } from 'class-transformer';
import { BaseEntity } from 'src/infrastructure/base/base-entity';
import { OrganizationEntity } from 'src/modules/organization/entities/organization.entity';
import { AdminUserEntity } from 'src/modules/user/entities/admin-user.entity';
import { VolunteerUserEntity } from 'src/modules/user/entities/volunteer-user.entity';

import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { AccessRequestStatus } from '../enums/access-request-status.enum';

@Unique('one-request-per-org-volunteer', ['volunteerUser', 'organization'])
@Entity({ name: 'access_request' })
export class AccessRequestEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', name: 'status' })
  status: AccessRequestStatus;

  @Column({ type: 'text', name: 'rejection_reason' })
  rejectionReason: string;

  @Column({ type: 'jsonb', name: 'rejection_reason' })
  answers: { question: string; answer: string }[]; // TODO: create model

  @Column({ type: 'string', name: 'updated_by' })
  updatedBy: string; // TODO: updated everytime a new update is made

  @ManyToOne(() => AdminUserEntity)
  @JoinColumn({ name: 'updated_by' })
  adminUser: AdminUserEntity;

  /** volunteerUserId: The requester **/
  @Column({ type: 'string', name: 'volunteer_user_id' })
  volunteerUserId: string;

  @ManyToOne(() => VolunteerUserEntity)
  @JoinColumn({ name: 'volunteer_user_id' })
  volunteerUser: VolunteerUserEntity;

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
