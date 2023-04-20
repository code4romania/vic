import {
  HistoryActionColumn,
  HistoryActionType,
  HistoryEntityInterface,
  HistoryOriginalIdColumn,
} from '@anchan828/typeorm-history';
import { BaseEntity } from 'src/infrastructure/base/base-entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { VolunteerStatus } from '../../enums/volunteer-status.enum';

@Entity('volunteer_history')
export class VolunteerHistoryEntity
  extends BaseEntity
  implements HistoryEntityInterface
{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @HistoryOriginalIdColumn({ name: 'history_original_id' })
  originalID: string;

  @HistoryActionColumn({ name: 'history_action' })
  action: HistoryActionType;

  /**
   =============================================================
    Inherited properties

    WARNING: Make sure to keep the properties in sync between
    the parent entity (User) and the History table
   =============================================================
   */

  @Column({
    type: 'enum',
    enum: VolunteerStatus,
    name: 'status',
    default: VolunteerStatus.ACTIVE,
  })
  status: VolunteerStatus;

  @Column({ type: 'timestamptz', name: 'archived_on', nullable: true })
  archivedOn: Date;

  @Column({ type: 'timestamptz', name: 'blocked_on', nullable: true })
  blockedOn: Date;

  @Column({ type: 'varchar', name: 'volunteer_profile_id', nullable: true })
  volunteerProfileId: string;

  @Column({ type: 'varchar', name: 'archived_by', nullable: true })
  archivedById: string;

  @Column({ type: 'varchar', name: 'blocked_by', nullable: true })
  blockedById: string;

  @Column({ type: 'varchar', name: 'user_id' })
  userId: string;

  @Column({ type: 'varchar', name: 'organization_id' })
  organizationId: string;
}
