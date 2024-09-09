import { BaseEntity } from 'src/infrastructure/base/base-entity';
import { OrganizationEntity } from 'src/modules/organization/entities/organization.entity';
import { AdminUserEntity } from 'src/modules/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DocumentContractEntity } from './document-contract.entity';

@Entity({ name: 'document_template' })
export class DocumentTemplateEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', name: 'name' })
  name: string;

  // {
  //   "officialName": "Official name",
  //   "registeredOffice": "Registered office (👀 should it be composed?)",
  //   "CUI": "RO42211332",
  //   "legalRepresentativeName": "Legal representative's full name",
  //   "legalRepresentativeRole": "Legal representative's role"
  // }
  @Column({ type: 'jsonb', name: 'organization_data' })
  organizationData: object;

  @Column({ type: 'text', name: 'document_terms' })
  documentTerms: string; // HTML string from WYSIWYG

  @Column({ type: 'text', name: 'organization_id' })
  organizationId: string;

  @ManyToOne(() => OrganizationEntity)
  @JoinColumn({ name: 'organization_id' })
  organization: OrganizationEntity;

  @Column({ type: 'string', name: 'created_by_admin_id', nullable: true })
  createdByAdminId: string;

  @ManyToOne(() => AdminUserEntity)
  @JoinColumn({ name: 'created_by_admin_id' })
  createdByAdmin: AdminUserEntity;

  @OneToMany(
    () => DocumentContractEntity,
    (contract) => contract.documentTemplate,
    {
      onDelete: 'SET NULL',
    },
  )
  contracts: DocumentContractEntity[];
}
