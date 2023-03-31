import { VolunteerStatus } from 'src/modules/volunteer/enums/volunteer-status.enum';
import { ViewColumn, ViewEntity } from 'typeorm';
import { DashboardFilterInterval } from '../enums/dashboard-filter-interval.enum';

@ViewEntity('DashboardVolunteerStatusView', {
  expression: `with 
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
      to_char(date_trunc('day', daily_status.day), 'DD Mon') as date,
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
      to_char(date_trunc('month', monthly_status.month), 'Mon YYYY') as date,
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
      to_char(date_trunc('year', yearly_status.year), 'YYYY') as date,
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
  group by yearly_status.year, yearly_status.status, yearly_status.organization_id`,
})
export class DashboardVolunteerStatusView {
  @ViewColumn()
  date: string;

  @ViewColumn()
  status: VolunteerStatus;

  @ViewColumn()
  count: number;

  @ViewColumn()
  type: DashboardFilterInterval;

  @ViewColumn({ name: 'organization_id' })
  organizationId: string;
}
