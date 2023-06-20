import { MigrationInterface, QueryRunner } from 'typeorm';

export class ApproveRejectionContractUpdates1687268980009
  implements MigrationInterface
{
  name = 'ApproveRejectionContractUpdates1687268980009';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "contract" ADD "created_by_admin_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract" ADD "approved_on" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(`ALTER TABLE "contract" ADD "approved_by" uuid`);
    await queryRunner.query(
      `ALTER TABLE "contract" ADD "rejection_reason" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract" ADD "rejected_on" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(`ALTER TABLE "contract" ADD "rejected_by" uuid`);
    await queryRunner.query(
      `ALTER TABLE "contract" ADD CONSTRAINT "FK_fa51adf14469c57a9ad0e22ae4e" FOREIGN KEY ("created_by_admin_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract" ADD CONSTRAINT "FK_e7adc827616fe1b39dbe41d0370" FOREIGN KEY ("approved_by") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract" ADD CONSTRAINT "FK_d4dd919168715a077dd3a164a37" FOREIGN KEY ("rejected_by") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "contract" DROP CONSTRAINT "FK_d4dd919168715a077dd3a164a37"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract" DROP CONSTRAINT "FK_e7adc827616fe1b39dbe41d0370"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract" DROP CONSTRAINT "FK_fa51adf14469c57a9ad0e22ae4e"`,
    );
    await queryRunner.query(`ALTER TABLE "contract" DROP COLUMN "rejected_by"`);
    await queryRunner.query(`ALTER TABLE "contract" DROP COLUMN "rejected_on"`);
    await queryRunner.query(
      `ALTER TABLE "contract" DROP COLUMN "rejection_reason"`,
    );
    await queryRunner.query(`ALTER TABLE "contract" DROP COLUMN "approved_by"`);
    await queryRunner.query(`ALTER TABLE "contract" DROP COLUMN "approved_on"`);
    await queryRunner.query(
      `ALTER TABLE "contract" DROP COLUMN "created_by_admin_id"`,
    );
  }
}
