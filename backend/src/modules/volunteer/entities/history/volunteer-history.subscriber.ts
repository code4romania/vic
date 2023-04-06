import { HistoryEntitySubscriber } from '@anchan828/typeorm-history';
import { EventSubscriber } from 'typeorm';
import { VolunteerEntity } from '../volunteer.entity';
import { VolunteerHistoryEntity } from './volunteer-history.entity';

@EventSubscriber()
export class VolunteerHistorySubscriber extends HistoryEntitySubscriber<
  VolunteerEntity,
  VolunteerHistoryEntity
> {
  get entity(): typeof VolunteerEntity {
    return VolunteerEntity;
  }
  get historyEntity(): typeof VolunteerHistoryEntity {
    return VolunteerHistoryEntity;
  }
}
