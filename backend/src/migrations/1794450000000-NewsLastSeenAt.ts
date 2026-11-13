import { MigrationInterface, QueryRunner } from 'typeorm';

// The unread count on the mobile Home bell: news newer than the last time the volunteer opened
// "Noutăți". Existing users start at the migration time, so nobody wakes up to a badge for old news.
export class NewsLastSeenAt1794450000000 implements MigrationInterface {
  name = 'NewsLastSeenAt1794450000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "news_last_seen_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "news_last_seen_at"`,
    );
  }
}
