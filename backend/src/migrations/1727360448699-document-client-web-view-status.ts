import { MigrationInterface, QueryRunner } from 'typeorm';

export class DocumentClientWebViewStatus1727360448699
  implements MigrationInterface
{
  name = 'DocumentClientWebViewStatus1727360448699';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`,
      ['VIEW', 'DocumentContractWebItemView', 'public'],
    );
    await queryRunner.query(`DROP VIEW "DocumentContractWebItemView"`);
    await queryRunner.query(`CREATE VIEW "DocumentContractWebItemView" AS 
    SELECT
      dc.id as "document_id",
      dc.document_number,
      dc.document_start_date,
      dc.document_end_date,
      CASE 
          WHEN dc.status = 'APPROVED' AND 
              dc.document_start_date <= CURRENT_DATE AND 
              dc.document_end_date >= CURRENT_DATE 
          THEN 'ACTIVE'
          WHEN dc.status = 'APPROVED' AND 
              dc.document_start_date > CURRENT_DATE 
          THEN 'NOT_STARTED'
          WHEN dc.status = 'APPROVED' AND 
              dc.document_end_date < CURRENT_DATE 
          THEN 'EXPIRED'
          ELSE dc.status::text
      END AS "status",
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
  `);
    await queryRunner.query(
      `INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
      [
        'public',
        'VIEW',
        'DocumentContractWebItemView',
        'SELECT\n      dc.id as "document_id",\n      dc.document_number,\n      dc.document_start_date,\n      dc.document_end_date,\n      CASE \n          WHEN dc.status = \'APPROVED\' AND \n              dc.document_start_date <= CURRENT_DATE AND \n              dc.document_end_date >= CURRENT_DATE \n          THEN \'ACTIVE\'\n          WHEN dc.status = \'APPROVED\' AND \n              dc.document_start_date > CURRENT_DATE \n          THEN \'NOT_STARTED\'\n          WHEN dc.status = \'APPROVED\' AND \n              dc.document_end_date < CURRENT_DATE \n          THEN \'EXPIRED\'\n          ELSE dc.status::text\n      END AS "status",\n      dc.file_path as "document_file_path",\n      dc.document_template_id,\n      dt."name" as "document_template_name",\n      dc.volunteer_id,\n      dc.volunteer_data->>\'name\' as "volunteer_name",\n      dc.created_by_admin_id, \n      "adminUser"."name" as "created_by_admin_name",\n      \n      dc.rejection_date,\n      dc.rejection_reason,\n      dc.rejected_by_id,\n      "rejectionUser".name as "rejected_by_name",\n\n      dc.organization_id,\n\n      dc.created_on, \n      dc.updated_on\n    FROM\n      document_contract dc\n      LEFT JOIN volunteer v ON v.id = dc.id\n      LEFT JOIN document_template dt on dt.id = dc.document_template_id\n      LEFT JOIN "user" "adminUser" ON dc.created_by_admin_id = "adminUser".id\n      LEFT JOIN "user" "rejectionUser" ON dc.rejected_by_id = "rejectionUser".id',
      ],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`,
      ['VIEW', 'DocumentContractWebItemView', 'public'],
    );
    await queryRunner.query(`DROP VIEW "DocumentContractWebItemView"`);
    await queryRunner.query(`CREATE VIEW "DocumentContractWebItemView" AS SELECT
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
      LEFT JOIN "user" "rejectionUser" ON dc.rejected_by_id = "rejectionUser".id`);
    await queryRunner.query(
      `INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
      [
        'public',
        'VIEW',
        'DocumentContractWebItemView',
        'SELECT\n      dc.id as "document_id",\n      dc.document_number,\n      dc.document_start_date,\n      dc.document_end_date,\n      dc.status,\n      dc.file_path as "document_file_path",\n      dc.document_template_id,\n      dt."name" as "document_template_name",\n      dc.volunteer_id,\n      dc.volunteer_data->>\'name\' as "volunteer_name",\n      dc.created_by_admin_id, \n      "adminUser"."name" as "created_by_admin_name",\n      \n      dc.rejection_date,\n      dc.rejection_reason,\n      dc.rejected_by_id,\n      "rejectionUser".name as "rejected_by_name",\n\n      dc.organization_id,\n\n      dc.created_on, \n      dc.updated_on\n    FROM\n      document_contract dc\n      LEFT JOIN volunteer v ON v.id = dc.id\n      LEFT JOIN document_template dt on dt.id = dc.document_template_id\n      LEFT JOIN "user" "adminUser" ON dc.created_by_admin_id = "adminUser".id\n      LEFT JOIN "user" "rejectionUser" ON dc.rejected_by_id = "rejectionUser".id',
      ],
    );
  }
}
