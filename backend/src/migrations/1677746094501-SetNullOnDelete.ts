import { MigrationInterface, QueryRunner } from 'typeorm';

export class SetNullOnDelete1677746094501 implements MigrationInterface {
  name = 'SetNullOnDelete1677746094501';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "volunteer_profile" DROP CONSTRAINT "FK_4fbf3b509d48419c2951daf0278"`,
    );
    await queryRunner.query(
      `ALTER TABLE "volunteer_profile" DROP CONSTRAINT "FK_4feb7f4800b1c967943005c50ab"`,
    );
    await queryRunner.query(
      `ALTER TABLE "volunteer_profile" DROP CONSTRAINT "FK_662788cdc80ca97f6b9ca2b5823"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_type" DROP CONSTRAINT "FK_0eb7496834e307dabdb3065910b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_type" DROP CONSTRAINT "FK_a0e14b26bf646dc2298dd620f4f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_type" DROP CONSTRAINT "FK_fbc413d412c8d588b9f124c860e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "volunteer_profile" ADD CONSTRAINT "FK_4fbf3b509d48419c2951daf0278" FOREIGN KEY ("branch_id") REFERENCES "organization_structure"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "volunteer_profile" ADD CONSTRAINT "FK_662788cdc80ca97f6b9ca2b5823" FOREIGN KEY ("department_id") REFERENCES "organization_structure"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "volunteer_profile" ADD CONSTRAINT "FK_4feb7f4800b1c967943005c50ab" FOREIGN KEY ("role_id") REFERENCES "organization_structure"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_type" ADD CONSTRAINT "FK_a0e14b26bf646dc2298dd620f4f" FOREIGN KEY ("branch_id") REFERENCES "organization_structure"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_type" ADD CONSTRAINT "FK_fbc413d412c8d588b9f124c860e" FOREIGN KEY ("department_id") REFERENCES "organization_structure"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_type" ADD CONSTRAINT "FK_0eb7496834e307dabdb3065910b" FOREIGN KEY ("role_id") REFERENCES "organization_structure"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "activity_type" DROP CONSTRAINT "FK_0eb7496834e307dabdb3065910b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_type" DROP CONSTRAINT "FK_fbc413d412c8d588b9f124c860e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_type" DROP CONSTRAINT "FK_a0e14b26bf646dc2298dd620f4f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "volunteer_profile" DROP CONSTRAINT "FK_4feb7f4800b1c967943005c50ab"`,
    );
    await queryRunner.query(
      `ALTER TABLE "volunteer_profile" DROP CONSTRAINT "FK_662788cdc80ca97f6b9ca2b5823"`,
    );
    await queryRunner.query(
      `ALTER TABLE "volunteer_profile" DROP CONSTRAINT "FK_4fbf3b509d48419c2951daf0278"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_type" ADD CONSTRAINT "FK_fbc413d412c8d588b9f124c860e" FOREIGN KEY ("department_id") REFERENCES "organization_structure"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_type" ADD CONSTRAINT "FK_a0e14b26bf646dc2298dd620f4f" FOREIGN KEY ("branch_id") REFERENCES "organization_structure"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_type" ADD CONSTRAINT "FK_0eb7496834e307dabdb3065910b" FOREIGN KEY ("role_id") REFERENCES "organization_structure"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "volunteer_profile" ADD CONSTRAINT "FK_662788cdc80ca97f6b9ca2b5823" FOREIGN KEY ("department_id") REFERENCES "organization_structure"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "volunteer_profile" ADD CONSTRAINT "FK_4feb7f4800b1c967943005c50ab" FOREIGN KEY ("role_id") REFERENCES "organization_structure"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "volunteer_profile" ADD CONSTRAINT "FK_4fbf3b509d48419c2951daf0278" FOREIGN KEY ("branch_id") REFERENCES "organization_structure"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
