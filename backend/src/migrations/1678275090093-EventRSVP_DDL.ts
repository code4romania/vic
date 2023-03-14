import { MigrationInterface, QueryRunner } from 'typeorm';

export class EventRSVP_DDL1678275090093 implements MigrationInterface {
  name = 'EventRSVP_DDL1678275090093';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "event_rsvp" ("deleted_on" TIMESTAMP WITH TIME ZONE, "created_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "going" boolean NOT NULL, "mention" text, "event_id" uuid NOT NULL, "user_id" uuid NOT NULL, CONSTRAINT "user_in_event" UNIQUE ("user_id", "event_id"), CONSTRAINT "PK_4db7e42ccdfb61849becf953e36" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_73883711d73221708472098dec" ON "event_rsvp" ("created_on") `,
    );
    await queryRunner.query(
      `ALTER TABLE "event_rsvp" ADD CONSTRAINT "FK_8062a5e2bde78e576ff7c66a98a" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_rsvp" ADD CONSTRAINT "FK_994865e8225d3917e3b8287a198" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "event_rsvp" DROP CONSTRAINT "FK_994865e8225d3917e3b8287a198"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_rsvp" DROP CONSTRAINT "FK_8062a5e2bde78e576ff7c66a98a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_73883711d73221708472098dec"`,
    );
    await queryRunner.query(`DROP TABLE "event_rsvp"`);
  }
}
