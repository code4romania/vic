import { BaseEntity } from 'src/infrastructure/base/base-entity';
import { ActivityLogEntity } from 'src/modules/activity-log/entities/activity-log.entity';
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

  @Column({
    type: 'enum',
    enum: EventStatus,
    name: 'status',
    default: EventStatus.PUBLISHED,
  })
  status: EventStatus;

  // Maximum number of registered volunteers; null = no limit (VIC 2.0)
  @Column({ type: 'integer', name: 'capacity', nullable: true })
  capacity?: number;

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

  @OneToMany(() => EventRSVPEntity, (eventRSVP) => eventRSVP.event)
  eventRSVPs: EventRSVPEntity[];

  @OneToMany(() => ActivityLogEntity, (activityLog) => activityLog.event)
  activityLogs: ActivityLogEntity[];
}
