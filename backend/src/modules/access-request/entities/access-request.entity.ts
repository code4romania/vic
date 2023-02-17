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
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AccessRequestStatus } from '../enums/access-request-status.enum';
import { IAccessRequestQA } from '../model/access-request.model';

// @Unique: Only one "pending" request, "requestedBy" a user for a "organization"
@Entity({ name: 'access_request' })
export class AccessRequestEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'text',
    name: 'status',
    default: AccessRequestStatus.PENDING,
  })
  status: AccessRequestStatus;

  @Column({ type: 'text', name: 'rejection_reason', nullable: true })
  rejectionReason: string;

  @Column({ type: 'jsonb', name: 'answers' })
  answers: IAccessRequestQA[];

  @Column({ type: 'string', name: 'updated_by', nullable: true })
  updatedById: string;

  @ManyToOne(() => AdminUserEntity)
  @JoinColumn({ name: 'updated_by' })
  updatedBy: AdminUserEntity;

  @Column({ type: 'string', name: 'requested_by' })
  requestedById: string;

  @ManyToOne(() => RegularUserEntity)
  @JoinColumn({ name: 'requested_by' })
  requestedBy: RegularUserEntity;

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
