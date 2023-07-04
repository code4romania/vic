import { BaseEntity } from 'src/infrastructure/base/base-entity';
import { ActivityLogEntity } from 'src/modules/activity-log/entities/activity-log.entity';
import { ActivityTypeEntity } from 'src/modules/activity-type/entities/activity-type.entity';
import { OrganizationStructureEntity } from 'src/modules/organization/entities/organization-structure.entity';
import { OrganizationEntity } from 'src/modules/organization/entities/organization.entity';

import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EventAttendOptions } from '../enums/event-attendance-options.enum';
import { EventStatus } from '../enums/event-status.enum';
import { EventRSVPEntity } from './event-rsvp.entity';

@Entity({ name: 'event' })
export class EventEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', name: 'name' })
  name: string;

  @Column({ type: 'text', name: 'description' })
  description: string;

  @Column({ type: 'timestamptz', name: 'start_date' })
  startDate: Date;

  @Column({ type: 'timestamptz', name: 'end_date', nullable: true })
  endDate?: Date;

  @Column({ type: 'text', name: 'location', nullable: true })
  location?: string;

  @Column({ type: 'boolean', name: 'is_public', default: false })
  isPublic: boolean;

  @Column({ type: 'text', name: 'poster', nullable: true })
  poster?: string;

  @Column({ type: 'text', name: 'poster_path', nullable: true })
  posterPath?: string;

  @Column({
    type: 'enum',
    enum: EventStatus,
    name: 'status',
    default: EventStatus.PUBLISHED,
  })
  status: EventStatus;

  @Column({
    type: 'enum',
    enum: EventAttendOptions,
    name: 'attendance_type',
    default: EventAttendOptions.SIMPLE,
  })
  attendanceType: EventAttendOptions;

  @Column({ type: 'text', name: 'attendance_mention', nullable: true })
  attendanceMention: string;

  @Column({ type: 'text', name: 'observation', nullable: true })
  observation: string;

  @Column({
    type: 'varchar',
    name: 'organization_id',
  })
  organizationId: string;

  @ManyToOne(() => OrganizationEntity)
  @JoinColumn({ name: 'organization_id' })
  organization: OrganizationEntity;

  @ManyToMany(() => OrganizationStructureEntity, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinTable()
  targets: OrganizationStructureEntity[];

  @ManyToMany(() => ActivityTypeEntity, { onDelete: 'SET NULL' })
  @JoinTable()
  tasks: ActivityTypeEntity[];

  @OneToMany(() => EventRSVPEntity, (eventRSVP) => eventRSVP.event)
  eventRSVPs: EventRSVPEntity[];

  @OneToMany(() => ActivityLogEntity, (activityLog) => activityLog.event)
  activityLogs: ActivityLogEntity[];
}
