import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateDocumentListViewWithComputedStatuses1727349193760
  implements MigrationInterface
{
  name = 'UpdateDocumentListViewWithComputedStatuses1727349193760';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // This migration updates the DocumentContractListView to include computed statuses
    // The changes are as follows:
    // 1. The status field now uses a CASE statement to compute dynamic statuses
    // 2. New computed statuses: 'ACTIVE', 'NOT_STARTED', 'EXPIRED'
    // 3. The computation is based on the document's start date, end date, and current date
    // 4. The original status is preserved for non-APPROVED documents

    await queryRunner.query(
      `DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`,
      ['VIEW', 'DocumentContractListView', 'public'],
    );
    await queryRunner.query(`DROP VIEW "DocumentContractListView"`);
    await queryRunner.query(`CREATE VIEW "DocumentContractListView" AS 
    SELECT 
      document_contract.id AS document_id,
      document_contract.document_number,

      
      CASE 
          WHEN document_contract.status = 'APPROVED' AND 
              document_contract.document_start_date <= CURRENT_DATE AND 
              document_contract.document_end_date >= CURRENT_DATE 
          THEN 'ACTIVE'
          WHEN document_contract.status = 'APPROVED' AND 
              document_contract.document_start_date > CURRENT_DATE 
          THEN 'NOT_STARTED'
          WHEN document_contract.status = 'APPROVED' AND 
              document_contract.document_end_date < CURRENT_DATE 
          THEN 'EXPIRED'
          ELSE document_contract.status::text
      END AS "status",

      document_contract.document_start_date,
      document_contract.document_end_date,
      document_contract.file_path AS document_file_path,
      organization.id AS organization_id,
      organization.name AS organization_name,
      volunteer.id AS volunteer_id,
      "user".name AS volunteer_name
  FROM document_contract
    JOIN volunteer ON document_contract.volunteer_id = volunteer.id
    JOIN "user" ON "user".id = volunteer.user_id
    JOIN organization ON document_contract.organization_id = organization.id;
  `);
    await queryRunner.query(
      `INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
      [
        'public',
        'VIEW',
        'DocumentContractListView',
        "SELECT \n      document_contract.id AS document_id,\n      document_contract.document_number,\n\n      \n      CASE \n          WHEN document_contract.status = 'APPROVED' AND \n              document_contract.document_start_date <= CURRENT_DATE AND \n              document_contract.document_end_date >= CURRENT_DATE \n          THEN 'ACTIVE'\n          WHEN document_contract.status = 'APPROVED' AND \n              document_contract.document_start_date > CURRENT_DATE \n          THEN 'NOT_STARTED'\n          WHEN document_contract.status = 'APPROVED' AND \n              document_contract.document_end_date < CURRENT_DATE \n          THEN 'EXPIRED'\n          ELSE document_contract.status::text\n      END AS \"status\",\n\n      document_contract.document_start_date,\n      document_contract.document_end_date,\n      document_contract.file_path AS document_file_path,\n      organization.id AS organization_id,\n      organization.name AS organization_name,\n      volunteer.id AS volunteer_id,\n      \"user\".name AS volunteer_name\n  FROM document_contract\n    JOIN volunteer ON document_contract.volunteer_id = volunteer.id\n    JOIN \"user\" ON \"user\".id = volunteer.user_id\n    JOIN organization ON document_contract.organization_id = organization.id;",
      ],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // This rollback removes the computed statuses and reverts to the original view definition
    await queryRunner.query(
      `DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`,
      ['VIEW', 'DocumentContractListView', 'public'],
    );
    await queryRunner.query(`DROP VIEW "DocumentContractListView"`);
    await queryRunner.query(`CREATE VIEW "DocumentContractListView" AS SELECT
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
        JOIN organization ON document_contract.organization_id = organization.id`);
    await queryRunner.query(
      `INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
      [
        'public',
        'VIEW',
        'DocumentContractListView',
        'SELECT\n        document_contract.id as document_id,\n        document_contract.document_number as document_number,\n        document_contract.status as status,\n        document_contract.document_start_date as document_start_date,\n        document_contract.document_end_date as document_end_date,   \n        document_contract.file_path AS document_file_path,\n        organization.id AS organization_id,\n        organization.name AS organization_name,\n        volunteer.id AS volunteer_id,\n        "user"."name" AS volunteer_name\n    FROM\n        document_contract\n        JOIN volunteer ON document_contract.volunteer_id = volunteer.id\n        JOIN "user" ON "user".id = volunteer.user_id\n        JOIN organization ON document_contract.organization_id = organization.id',
      ],
    );
  }
}
