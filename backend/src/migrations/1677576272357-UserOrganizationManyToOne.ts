import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserOrganizationManyToOne1677576272357
  implements MigrationInterface
{
  name = 'UserOrganizationManyToOne1677576272357';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_3e103cdf85b7d6cb620b4db0f0c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "REL_3e103cdf85b7d6cb620b4db0f0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_type" DROP CONSTRAINT "FK_780343b632ab25cd9dcfb95c133"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_type" DROP CONSTRAINT "name_organization"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_type" ALTER COLUMN "organization_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_type" ADD CONSTRAINT "name_organization" UNIQUE ("name", "organization_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_3e103cdf85b7d6cb620b4db0f0c" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_type" ADD CONSTRAINT "FK_780343b632ab25cd9dcfb95c133" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "activity_type" DROP CONSTRAINT "FK_780343b632ab25cd9dcfb95c133"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_3e103cdf85b7d6cb620b4db0f0c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_type" DROP CONSTRAINT "name_organization"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_type" ALTER COLUMN "organization_id" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_type" ADD CONSTRAINT "name_organization" UNIQUE ("name", "organization_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_type" ADD CONSTRAINT "FK_780343b632ab25cd9dcfb95c133" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "REL_3e103cdf85b7d6cb620b4db0f0" UNIQUE ("organization_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_3e103cdf85b7d6cb620b4db0f0c" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
