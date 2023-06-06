import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddActiveOrganizationOnRegulaUser1685542753463
  implements MigrationInterface
{
  name = 'AddActiveOrganizationOnRegulaUser1685542753463';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "active_organization_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_7f582b95751011f9dc9d76cfde8" FOREIGN KEY ("active_organization_id") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_7f582b95751011f9dc9d76cfde8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "active_organization_id"`,
    );
  }
}
