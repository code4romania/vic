import { MigrationInterface, QueryRunner } from 'typeorm';

export class DashboardVolunteerStatusView1680511587196
  implements MigrationInterface
{
  name = 'DashboardVolunteerStatusView1680511587196';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."volunteer_history_history_action_enum" AS ENUM('CREATED', 'UPDATED', 'DELETED')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."volunteer_history_status_enum" AS ENUM('active', 'archived', 'blocked')`,
    );
    await queryRunner.query(
      `CREATE TABLE "volunteer_history" ("deleted_on" TIMESTAMP WITH TIME ZONE, "created_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_on" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "history_original_id" character varying NOT NULL, "history_action" "public"."volunteer_history_history_action_enum" NOT NULL DEFAULT 'CREATED', "status" "public"."volunteer_history_status_enum" NOT NULL DEFAULT 'active', "archived_on" TIMESTAMP WITH TIME ZONE, "blocked_on" TIMESTAMP WITH TIME ZONE, "volunteer_profile_id" character varying, "archived_by" character varying, "blocked_by" character varying, "user_id" character varying NOT NULL, "organization_id" character varying NOT NULL, CONSTRAINT "PK_c93432571fac2dc102eeed10ff3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a50ed7eb31ad4c1dee70052547" ON "volunteer_history" ("created_on") `,
    );
    await queryRunner.query(`CREATE VIEW "DashboardVolunteerStatusView" AS with 
  date_day_series as (
      select 
          date_trunc('day', (current_date - offs)) as day
      from generate_series(0, 365*5, 1) as offs),
  
  --generates month series for the last 5 years from current_date
  date_month_series as (
      select 
          distinct date_trunc('month', day) as month 
      from date_day_series
  ),
  
  --generates year series for the last 5 years from current date
  date_year_series as (
      select 
          distinct date_trunc('year', month) as year 
      from date_month_series
  )
  
  --returns the latest status for each day
  select 
      daily_status.day as date,
      daily_status.status,
      case 
          when daily_status.status is not null 
              then count(*) 
          else 0
      end as count,
      'daily' as type,
      daily_status.organization_id
  from (
      --ranking of the statuses/days
      select
          rank() over (
              partition by day_series.day, 
                           volunteer_history.history_original_id
              order by volunteer_history.updated_on desc
          ) as rnk,
          day_series.day,
          volunteer_history.status,
          volunteer_history.updated_on,
          volunteer_history.history_original_id,
          volunteer_history.organization_id
  
      from date_day_series day_series
  
      left join "volunteer_history" volunteer_history
          on date_trunc('day', volunteer_history.updated_on) <= day_series.day
  
      where day_series.day > date_trunc('day', (current_date - 30))
      ) daily_status
  where daily_status.rnk = 1
  
  group by daily_status.day, 
           daily_status.status,
           daily_status.organization_id
  
  union all 
  --returns the latest status for each month
  select 
      monthly_status.month as date,
      monthly_status.status,
      case 
          when monthly_status.status is not null 
              then count(*) 
          else 0
      end as count,
      'monthly' as type,
      monthly_status.organization_id
  from (
      --ranking of the statuses/months
      select
          rank() over (
              partition by month_series.month, 
                           volunteer_history.history_original_id
              order by volunteer_history.updated_on desc
          ) as rnk,
          month_series.month,
          volunteer_history.status,
          volunteer_history.updated_on,
          volunteer_history.history_original_id,
          volunteer_history.organization_id
  
      from date_month_series month_series
  
      left join "volunteer_history" volunteer_history
          on date_trunc('month', volunteer_history.updated_on) <= date_trunc('month', month_series.month)
      
      where date_trunc('month', month_series.month) > date_trunc('day', (current_date - 365))
      ) monthly_status
  where monthly_status.rnk=1
  
  group by monthly_status.month, 
           monthly_status.status,
           monthly_status.organization_id
  union all
  --returns the latest status for each year
  select 
      yearly_status.year as date,
      yearly_status.status,
      case 
          when yearly_status.status is not null 
              then count(*) 
          else 0
      end as count,
      'yearly' as type,
      yearly_status.organization_id
  from (
      --ranking of the statuses/years
      select
          rank() over (
              partition by year_series.year, 
                           volunteer_history.history_original_id
              order by volunteer_history.updated_on desc
          ) as rnk,
          year_series.year,
          volunteer_history.status,
          volunteer_history.updated_on,
          volunteer_history.history_original_id,
          volunteer_history.organization_id
  
      from date_year_series year_series
  
      left join "volunteer_history" volunteer_history
          on date_trunc('year', volunteer_history.updated_on) <= date_trunc('year', year_series.year)
      
      where date_trunc('year', year_series.year) > date_trunc('year', (current_date - 365*5))
      ) yearly_status
  where yearly_status.rnk=1
  group by yearly_status.year, yearly_status.status, yearly_status.organization_id
  `);
    await queryRunner.query(
      `INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
      [
        'public',
        'VIEW',
        'DashboardVolunteerStatusView',
        "with \n  date_day_series as (\n      select \n          date_trunc('day', (current_date - offs)) as day\n      from generate_series(0, 365*5, 1) as offs),\n  \n  --generates month series for the last 5 years from current_date\n  date_month_series as (\n      select \n          distinct date_trunc('month', day) as month \n      from date_day_series\n  ),\n  \n  --generates year series for the last 5 years from current date\n  date_year_series as (\n      select \n          distinct date_trunc('year', month) as year \n      from date_month_series\n  )\n  \n  --returns the latest status for each day\n  select \n      daily_status.day as date,\n      daily_status.status,\n      case \n          when daily_status.status is not null \n              then count(*) \n          else 0\n      end as count,\n      'daily' as type,\n      daily_status.organization_id\n  from (\n      --ranking of the statuses/days\n      select\n          rank() over (\n              partition by day_series.day, \n                           volunteer_history.history_original_id\n              order by volunteer_history.updated_on desc\n          ) as rnk,\n          day_series.day,\n          volunteer_history.status,\n          volunteer_history.updated_on,\n          volunteer_history.history_original_id,\n          volunteer_history.organization_id\n  \n      from date_day_series day_series\n  \n      left join \"volunteer_history\" volunteer_history\n          on date_trunc('day', volunteer_history.updated_on) <= day_series.day\n  \n      where day_series.day > date_trunc('day', (current_date - 30))\n      ) daily_status\n  where daily_status.rnk = 1\n  \n  group by daily_status.day, \n           daily_status.status,\n           daily_status.organization_id\n  \n  union all \n  --returns the latest status for each month\n  select \n      monthly_status.month as date,\n      monthly_status.status,\n      case \n          when monthly_status.status is not null \n              then count(*) \n          else 0\n      end as count,\n      'monthly' as type,\n      monthly_status.organization_id\n  from (\n      --ranking of the statuses/months\n      select\n          rank() over (\n              partition by month_series.month, \n                           volunteer_history.history_original_id\n              order by volunteer_history.updated_on desc\n          ) as rnk,\n          month_series.month,\n          volunteer_history.status,\n          volunteer_history.updated_on,\n          volunteer_history.history_original_id,\n          volunteer_history.organization_id\n  \n      from date_month_series month_series\n  \n      left join \"volunteer_history\" volunteer_history\n          on date_trunc('month', volunteer_history.updated_on) <= date_trunc('month', month_series.month)\n      \n      where date_trunc('month', month_series.month) > date_trunc('day', (current_date - 365))\n      ) monthly_status\n  where monthly_status.rnk=1\n  \n  group by monthly_status.month, \n           monthly_status.status,\n           monthly_status.organization_id\n  union all\n  --returns the latest status for each year\n  select \n      yearly_status.year as date,\n      yearly_status.status,\n      case \n          when yearly_status.status is not null \n              then count(*) \n          else 0\n      end as count,\n      'yearly' as type,\n      yearly_status.organization_id\n  from (\n      --ranking of the statuses/years\n      select\n          rank() over (\n              partition by year_series.year, \n                           volunteer_history.history_original_id\n              order by volunteer_history.updated_on desc\n          ) as rnk,\n          year_series.year,\n          volunteer_history.status,\n          volunteer_history.updated_on,\n          volunteer_history.history_original_id,\n          volunteer_history.organization_id\n  \n      from date_year_series year_series\n  \n      left join \"volunteer_history\" volunteer_history\n          on date_trunc('year', volunteer_history.updated_on) <= date_trunc('year', year_series.year)\n      \n      where date_trunc('year', year_series.year) > date_trunc('year', (current_date - 365*5))\n      ) yearly_status\n  where yearly_status.rnk=1\n  group by yearly_status.year, yearly_status.status, yearly_status.organization_id",
      ],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`,
      ['VIEW', 'DashboardVolunteerStatusView', 'public'],
    );
    await queryRunner.query(`DROP VIEW "DashboardVolunteerStatusView"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a50ed7eb31ad4c1dee70052547"`,
    );
    await queryRunner.query(`DROP TABLE "volunteer_history"`);
    await queryRunner.query(
      `DROP TYPE "public"."volunteer_history_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."volunteer_history_history_action_enum"`,
    );
  }
}
