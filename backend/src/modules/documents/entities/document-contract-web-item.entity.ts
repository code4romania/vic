import { Column, ViewColumn, ViewEntity } from 'typeorm';
import { DocumentContractStatus } from '../enums/contract-status.enum';

@ViewEntity('DocumentContractWebItemView', {
  /*

    Get one document contract for the web

    Why: Avoid loading too much data from the database. Use only for displaying one document contract.


    | Field                  | Description                          |
    |------------------------|--------------------------------------|
    | id                     | Document contract ID                 |
    | document_number        | Document number                      |
    | document_start_date    | Document start date                  |
    | document_end_date      | Document end date                    |
    | status                 | Document contract status             |
    | document_template_id   | Document template ID                 |
    | document_template_name | Document template name               |
    | volunteer_id           | Volunteer ID                         |
    | volunteer_name         | Volunteer name                       |
    | created_by_admin_id    | Created by admin ID                  |
    | created_by_admin_name  | Created by admin name                |
    | rejection_date         | Rejection date                       |
    | rejection_reason       | Rejection reason                     |
    | rejected_by_id         | Rejected by ID                       |
    | rejected_by_name       | Rejected by name                     |
    | created_on             | Created on date                      |
    | updated_on             | Updated on date                      |
    */
  expression: `
    SELECT
      dc.id as "document_id",
      dc.document_number,
      dc.document_start_date,
      dc.document_end_date,
      dc.status,
      dc.file_path as "document_file_path",
      dc.document_template_id,
      dt."name" as "document_template_name",
      dc.volunteer_id,
      dc.volunteer_data->>'name' as "volunteer_name",
      dc.created_by_admin_id, 
      "adminUser"."name" as "created_by_admin_name",
      
      dc.rejection_date,
      dc.rejection_reason,
      dc.rejected_by_id,
      "rejectionUser".name as "rejected_by_name",

      dc.organization_id,

      dc.created_on, 
      dc.updated_on
    FROM
      document_contract dc
      LEFT JOIN volunteer v ON v.id = dc.id
      LEFT JOIN document_template dt on dt.id = dc.document_template_id
      LEFT JOIN "user" "adminUser" ON dc.created_by_admin_id = "adminUser".id
      LEFT JOIN "user" "rejectionUser" ON dc.rejected_by_id = "rejectionUser".id
  `,
})
export class DocumentContractWebItemView {
  @ViewColumn({ name: 'document_id' })
  documentId: string;

  @ViewColumn({ name: 'document_number' })
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

  @ViewColumn({ name: 'document_template_id' })
  documentTemplateId: string;

  @ViewColumn({ name: 'document_template_name' })
  documentTemplateName: string;

  @ViewColumn({ name: 'volunteer_id' })
  volunteerId: string;

  @ViewColumn({ name: 'volunteer_name' })
  volunteerName: string;

  @ViewColumn({ name: 'created_by_admin_id' })
  createdByAdminId: string;

  @ViewColumn({ name: 'created_by_admin_name' })
  createdByAdminName: string;

  @ViewColumn({ name: 'rejection_date' })
  rejectionDate: Date;

  @ViewColumn({ name: 'rejection_reason' })
  rejectionReason: string;

  @ViewColumn({ name: 'rejected_by_id' })
  rejectedById: string;

  @ViewColumn({ name: 'rejected_by_name' })
  rejectedByName: string;

  @ViewColumn({ name: 'organization_id' })
  organizationId: string;

  @ViewColumn({ name: 'created_on' })
  createdOn: Date;

  @ViewColumn({ name: 'updated_on' })
  updatedOn: Date;
}
