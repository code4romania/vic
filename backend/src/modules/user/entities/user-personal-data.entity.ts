import { BaseEntity } from 'src/infrastructure/base/base-entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ILegalGuardian } from '../models/user-personal-data.model';
@Entity({ name: 'user_personal_data' })
export class UserPersonalDataEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', name: 'cnp', nullable: true })
  cnp: string;

  @Column({ type: 'text', name: 'identity_document_series' })
  identityDocumentSeries: string;

  @Column({ type: 'text', name: 'identity_document_number' })
  identityDocumentNumber: string;

  @Column({ type: 'text', name: 'address' })
  address: string;

  @Column({ type: 'date', name: 'identity_document_issue_date' })
  identityDocumentIssueDate: Date;

  @Column({
    type: 'date',
    name: 'identity_document_expiration_date',
  })
  identityDocumentExpirationDate: Date;

  @Column({ type: 'text', name: 'identity_document_issued_by', nullable: true })
  identityDocumentIssuedBy: string;

  @Column({ type: 'jsonb', name: 'legal_guardian', nullable: true })
  legalGuardian: ILegalGuardian;
}
