import { MigrationInterface, QueryRunner } from 'typeorm';

export class DDLDocumentTemplateListView1726046690797
  implements MigrationInterface
{
  name = 'DDLDocumentTemplateListView1726046690797';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE VIEW "DocumentTemplateListView" AS 
    SELECT
        document_template.id,
        document_template."name",
        document_template.created_on,
        document_template.organization_id,
        "user"."id" as created_by_id,
        "user"."name" as created_by_name,
        count(document_contract.id) as usage_count,
        max(document_contract.created_on) as last_usage
    FROM
        document_template
        LEFT JOIN document_contract ON document_template.id = document_contract.document_template_id
        LEFT JOIN "user" on document_template.created_by_admin_id = "user".id
    GROUP BY
        document_template.id,
        "user"."name",
        "user"."id"
  `);
    await queryRunner.query(
      `INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
      [
        'public',
        'VIEW',
        'DocumentTemplateListView',
        'SELECT\n        document_template.id,\n        document_template."name",\n        document_template.created_on,\n        document_template.organization_id,\n        "user"."id" as created_by_id,\n        "user"."name" as created_by_name,\n        count(document_contract.id) as usage_count,\n        max(document_contract.created_on) as last_usage\n    FROM\n        document_template\n        LEFT JOIN document_contract ON document_template.id = document_contract.document_template_id\n        LEFT JOIN "user" on document_template.created_by_admin_id = "user".id\n    GROUP BY\n        document_template.id,\n        "user"."name",\n        "user"."id"',
      ],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`,
      ['VIEW', 'DocumentTemplateListView', 'public'],
    );
    await queryRunner.query(`DROP VIEW "DocumentTemplateListView"`);
  }
}
