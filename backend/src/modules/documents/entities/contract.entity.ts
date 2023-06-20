import { BaseEntity } from 'src/infrastructure/base/base-entity';
import { OrganizationEntity } from 'src/modules/organization/entities/organization.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TemplateEntity } from './template.entity';
import { VolunteerEntity } from 'src/modules/volunteer/entities/volunteer.entity';
import { ContractStatus } from '../enums/contract-status.enum';
import { AdminUserEntity } from 'src/modules/user/entities/user.entity';

@Entity({ name: 'contract' })
export class ContractEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', name: 'contract_number' })
  contractNumber: string;

  @Column({ type: 'text', name: 'path' })
  path: string;

  @Column({ type: 'timestamptz', name: 'start_date' })
  startDate: Date;

  @Column({ type: 'timestamptz', name: 'end_date' })
  endDate: Date;

  @Column({
    type: 'enum',
    enum: ContractStatus,
    name: 'status',
    default: ContractStatus.PENDING_VOLUNTEER,
  })
  status: ContractStatus;

  @Column({
    type: 'varchar',
    name: 'organization_id',
  })
  organizationId: string;

  @ManyToOne(() => OrganizationEntity)
  @JoinColumn({ name: 'organization_id' })
  organization: OrganizationEntity;

  @Column({
    type: 'varchar',
    nullable: true,
    name: 'template_id',
  })
  templateId: string;

  @ManyToOne(() => TemplateEntity)
  @JoinColumn({ name: 'template_id' })
  template: TemplateEntity;

  @Column({
    type: 'varchar',
    name: 'volunteer_id',
  })
  volunteerId: string;

  @ManyToOne(() => VolunteerEntity)
  @JoinColumn({ name: 'volunteer_id' })
  volunteer: VolunteerEntity;

  @Column({ type: 'string', name: 'created_by_admin_id', nullable: true })
  createdByAdminId: string;

  @ManyToOne(() => AdminUserEntity)
  @JoinColumn({ name: 'created_by_admin_id' })
  createdByAdmin: AdminUserEntity;

  // ==================== APPROVAL =================================

  @Column({ type: 'timestamptz', name: 'approved_on', nullable: true })
  approvedOn: Date;

  @Column({ type: 'string', name: 'approved_by', nullable: true })
  approvedById: string;

  @ManyToOne(() => AdminUserEntity)
  @JoinColumn({ name: 'approved_by' })
  approvedBy: AdminUserEntity;

  // ==================== REJECTION =================================

  @Column({ type: 'text', name: 'rejection_reason', nullable: true })
  rejectionReason: string;

  @Column({ type: 'timestamptz', name: 'rejected_on', nullable: true })
  rejectedOn: Date;

  @Column({ type: 'string', name: 'rejected_by', nullable: true })
  rejectedById: string;

  @ManyToOne(() => AdminUserEntity)
  @JoinColumn({ name: 'rejected_by' })
  rejectedBy: AdminUserEntity;
}
