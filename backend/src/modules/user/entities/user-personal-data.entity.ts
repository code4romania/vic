import { BaseEntity } from 'src/infrastructure/base/base-entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
@Entity({ name: 'user_personal_data' })
export class UserPersonalDataEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', name: 'identity_document_series' })
  identityDocumentSeries: string;

  @Column({ type: 'text', name: 'identity_document_number', unique: true })
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
}
