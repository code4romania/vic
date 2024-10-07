/* eslint-disable @typescript-eslint/no-explicit-any */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrganizationIdToActionsArchive1727938379738
  implements MigrationInterface
{
  name = 'AddOrganizationIdToActionsArchive1727938379738';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "actions_archive" ADD "organization_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "actions_archive" ADD CONSTRAINT "FK_fa13764b4b3b3f7064046a76d49" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    const actionsArchive = await queryRunner.query(`
        SELECT 
          actions_archive.*,
          COALESCE(
            "user".organization_id,
            (actions_archive.event_data->>'organizationId')::uuid,
            volunteer.organization_id
          ) AS organization_id
        FROM actions_archive
        LEFT JOIN "user" ON actions_archive.author_id = "user".id
        LEFT JOIN volunteer ON (actions_archive.event_data->>'volunteerId')::uuid = volunteer.id
      `);

    for (const action of actionsArchive) {
      if (action.organization_id) {
        await queryRunner.query(
          `UPDATE actions_archive 
           SET organization_id = $1 
           WHERE id = $2`,
          [action.organization_id, action.id],
        );
      }
    }

    await queryRunner.query(
      `ALTER TABLE "actions_archive" ALTER COLUMN "organization_id" SET NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "actions_archive" DROP CONSTRAINT "FK_fa13764b4b3b3f7064046a76d49"`,
    );
    await queryRunner.query(
      `ALTER TABLE "actions_archive" DROP COLUMN "organization_id"`,
    );
  }
}
