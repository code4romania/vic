import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DocumentContractStatus } from '../enums/contract-status.enum';
import { OrganizationEntity } from 'src/modules/organization/entities/organization.entity';
import { DocumentTemplateEntity } from './document-template.entity';
import { AdminUserEntity } from 'src/modules/user/entities/user.entity';
import { VolunteerEntity } from 'src/modules/volunteer/entities/volunteer.entity';
import { BaseEntity } from 'src/infrastructure/base/base-entity';
import { PersonalData } from '../models/document-contract.model';
import { DocumentSignatureEntity } from './document-signature.entity';

@Entity({ name: 'document_contract' })
export class DocumentContractEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: DocumentContractStatus,
    name: 'status',
    default: DocumentContractStatus.CREATED,
  })
  status: DocumentContractStatus;

  @Column({ type: 'text', name: 'document_number' })
  documentNumber: string;

  @Column({ type: 'date', name: 'document_date' })
  documentDate: Date;

  @Column({ type: 'date', name: 'document_start_date' })
  documentStartDate: Date;

  @Column({ type: 'date', name: 'document_end_date' })
  documentEndDate: Date;

  @Column({ type: 'text', name: 'file_path', nullable: true })
  filePath: string;

  // ==================== VOLUNTEER RELATION =================================

  @Column({ type: 'jsonb', name: 'volunteer_data', nullable: false })
  volunteerData: PersonalData;

  @Column({ type: 'jsonb', name: 'volunteer_tutor_data', nullable: true })
  volunteerTutorData: PersonalData;

  @Column({
    type: 'varchar',
    name: 'volunteer_id',
  })
  volunteerId: string;

  @ManyToOne(() => VolunteerEntity)
  @JoinColumn({ name: 'volunteer_id' })
  volunteer: VolunteerEntity;

  // ==================== ORGANIZATION RELATION =================================
  @Column({
    type: 'varchar',
    name: 'organization_id',
  })
  organizationId: string;

  @ManyToOne(() => OrganizationEntity)
  @JoinColumn({ name: 'organization_id' })
  organization: OrganizationEntity;

  // ==================== TEMPLATE RELATION =================================

  @Column({
    type: 'varchar',
    nullable: true,
    name: 'document_template_id',
  })
  documentTemplateId: string;

  @ManyToOne(() => DocumentTemplateEntity)
  @JoinColumn({ name: 'document_template_id' })
  documentTemplate: DocumentTemplateEntity;

  // ==================== CONTRACT CREATED BY =================================

  @Column({
    type: 'varchar',
    name: 'created_by_admin_id',
  })
  createdByAdminId: string;

  @ManyToOne(() => AdminUserEntity)
  @JoinColumn({ name: 'created_by_admin_id' })
  createdByAdmin: AdminUserEntity;

  // ======================== SIGNATURES =================================
  @Column({
    type: 'varchar',
    name: 'ngo_legal_representative_signature_id',
    nullable: true,
  })
  ngoLegalRepresentativeSignatureId: string;

  @ManyToOne(() => DocumentSignatureEntity)
  @JoinColumn({ name: 'ngo_legal_representative_signature_id' })
  ngoLegalRepresentativeSignature: DocumentSignatureEntity;

  @Column({
    type: 'varchar',
    name: 'volunteer_signature_id',
    nullable: true,
  })
  volunteerSignatureId: string;

  @ManyToOne(() => DocumentSignatureEntity)
  @JoinColumn({ name: 'volunteer_signature_id' })
  volunteerSignature: DocumentSignatureEntity;

  @Column({
    type: 'varchar',
    name: 'tutor_signature_id',
    nullable: true,
  })
  tutorSignatureId: string;

  @ManyToOne(() => DocumentSignatureEntity)
  @JoinColumn({ name: 'tutor_signature_id' })
  tutorSignature: DocumentSignatureEntity;

  //   // ==================== APPROVAL =================================

  // TODO: instead of keeping here the approval/rejection/signatures we can keep them in ActionsArchive

  //   @Column({ type: 'timestamptz', name: 'approved_on', nullable: true })
  //   approvedOn: Date;

  //   @Column({ type: 'string', name: 'approved_by', nullable: true })
  //   approvedById: string;

  //   @ManyToOne(() => AdminUserEntity)
  //   @JoinColumn({ name: 'approved_by' })
  //   approvedBy: AdminUserEntity;

  //   // ==================== REJECTION =================================

  //   @Column({ type: 'text', name: 'rejection_reason', nullable: true })
  //   rejectionReason: string;

  //   @Column({ type: 'timestamptz', name: 'rejected_on', nullable: true })
  //   rejectedOn: Date;

  //   @Column({ type: 'string', name: 'rejected_by', nullable: true })
  //   rejectedById: string;

  //   @ManyToOne(() => AdminUserEntity)
  //   @JoinColumn({ name: 'rejected_by' })
  //   rejectedBy: AdminUserEntity;
}
