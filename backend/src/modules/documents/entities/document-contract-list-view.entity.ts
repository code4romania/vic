import { Column, ViewColumn, ViewEntity } from 'typeorm';
import { DocumentContractStatus } from '../enums/contract-status.enum';

@ViewEntity('DocumentContractListView', {
  expression: `
    SELECT
        document_contract.id as document_id,
        document_contract.document_number as document_number,
        document_contract.status as status,
        document_contract.document_start_date as document_start_date,
        document_contract.document_end_date as document_end_date,   
        document_contract.file_path AS document_file_path,
        organization.id AS organization_id,
        organization.name AS organization_name,
        volunteer.id AS volunteer_id,
        "user"."name" AS volunteer_name
    FROM
        document_contract
        JOIN volunteer ON document_contract.volunteer_id = volunteer.id
        JOIN "user" ON "user".id = volunteer.user_id
        JOIN organization ON document_contract.organization_id = organization.id
  `,
})
export class DocumentContractListViewEntity {
  @ViewColumn({ name: 'document_id' })
  documentId: string;

  @Column({ name: 'document_number' })
  documentNumber: string;

  // Use Column instead of ViewColumn because of https://github.com/typeorm/typeorm/issues/4320. Date was returned as Timestamp
  @Column({ name: 'document_start_date', type: 'date' })
  documentStartDate: Date;

  // Use Column instead of ViewColumn because of https://github.com/typeorm/typeorm/issues/4320. Date was returned as Timestamp
  @Column({ name: 'document_end_date', type: 'date' })
  documentEndDate: Date;

  @ViewColumn({ name: 'document_file_path' })
  documentFilePath: string;

  @ViewColumn({ name: 'status' })
  status: DocumentContractStatus;

  @ViewColumn({ name: 'volunteer_id' })
  volunteerId: string;

  @ViewColumn({ name: 'volunteer_name' })
  volunteerName: string;

  @ViewColumn({ name: 'organization_id' })
  organizationId: string;

  @ViewColumn({ name: 'organization_name' })
  organizationName: string;
}
