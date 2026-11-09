import { MigrationInterface, QueryRunner } from 'typeorm';

// VIC 2.0, issue #471: internal notes the NGO keeps on a volunteer.
export class VolunteerNotes1794290000000 implements MigrationInterface {
  name = 'VolunteerNotes1794290000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "volunteer" ADD "notes" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "volunteer" DROP COLUMN "notes"`);
  }
}
