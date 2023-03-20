import { BaseEntity } from 'src/infrastructure/base/base-entity';
import { ActivityTypeEntity } from 'src/modules/activity-type/entities/activity-type.entity';
import { EventEntity } from 'src/modules/event/entities/event.entity';
import { AdminUserEntity } from 'src/modules/user/entities/user.entity';
import { VolunteerEntity } from 'src/modules/volunteer/entities/volunteer.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ActivityLogStatus } from '../enums/activity-log-status.enum';

// TODO: UNIQUE? Seems not
@Entity({ name: 'activity_log' })
export class ActivityLogEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamptz', name: 'date' })
  date: Date;

  @Column({ type: 'integer', name: 'hours' })
  hours: number;

  @Column({ type: 'text', name: 'mentions', nullable: true })
  mentions: string;

  @Column({
    type: 'enum',
    enum: ActivityLogStatus,
    name: 'status',
    default: ActivityLogStatus.PENDING,
  })
  status: ActivityLogStatus;

  @Column({ type: 'string', name: 'created_by_admin_id', nullable: true })
  createdByAdminId: string;

  @ManyToOne(() => AdminUserEntity)
  @JoinColumn({ name: 'created_by_admin_id' })
  createdByAdmin: AdminUserEntity;

  // ==================== APPROVAL =================================

  @Column({ type: 'timestamptz', name: 'approved_on', nullable: true })
  approvedOn: Date;

  @Column({ type: 'string', name: 'approved_by', nullable: true })
  approvedById: string;

  @ManyToOne(() => AdminUserEntity)
  @JoinColumn({ name: 'approved_by' })
  approvedBy: AdminUserEntity;

  // ==================== REJECTION =================================

  @Column({ type: 'text', name: 'rejection_reason', nullable: true })
  rejectionReason: string;

  @Column({ type: 'timestamptz', name: 'rejected_on', nullable: true })
  rejectedOn: Date;

  @Column({ type: 'string', name: 'rejected_by', nullable: true })
  rejectedById: string;

  @ManyToOne(() => AdminUserEntity)
  @JoinColumn({ name: 'rejected_by' })
  rejectedBy: AdminUserEntity;

  // ==================== Volunteer =================================

  @Column({ type: 'string', name: 'volunteer_id' })
  volunteerId: string;

  @ManyToOne(() => VolunteerEntity)
  @JoinColumn({ name: 'volunteer_id' })
  volunteer: VolunteerEntity;

  // ==================== Event =================================

  @Column({ type: 'string', name: 'event_id', nullable: true })
  eventId: string;

  @ManyToOne(() => EventEntity)
  @JoinColumn({ name: 'event_id' })
  event: EventEntity;

  // ==================== Activity Type =================================

  @Column({ type: 'string', name: 'activity_type_id' })
  activityTypeId: string;

  @ManyToOne(() => ActivityTypeEntity)
  @JoinColumn({ name: 'activity_type_id' })
  activityType: ActivityTypeEntity;
}
