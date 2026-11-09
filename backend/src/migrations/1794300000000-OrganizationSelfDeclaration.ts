import { MigrationInterface, QueryRunner } from 'typeorm';

// VIC 2.0, issue #510: registration asks for the CUI and a self-declaration, never the statute.
export class OrganizationSelfDeclaration1794300000000
  implements MigrationInterface
{
  name = 'OrganizationSelfDeclaration1794300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organization" ADD "self_declared_at" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization" DROP COLUMN "statute_url"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organization" ADD "statute_url" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization" DROP COLUMN "self_declared_at"`,
    );
  }
}
