import { MigrationInterface, QueryRunner } from 'typeorm';

// App Store 5.1.1(v): the encrypted Apple refresh token of a login, revoked when the account is deleted.
export class AppleRefreshToken1794410000000 implements MigrationInterface {
  name = 'AppleRefreshToken1794410000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "auth_identity" ADD COLUMN IF NOT EXISTS "apple_refresh_token" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "auth_identity" DROP COLUMN IF EXISTS "apple_refresh_token"`,
    );
  }
}
