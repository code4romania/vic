import { BaseEntity } from 'src/infrastructure/base/base-entity';
import { OrganizationEntity } from 'src/modules/organization/entities/organization.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AnnouncementStatus } from '../enums/announcement-status.enum';
import { AnnouncementType } from '../enums/announcement-type.enum';

@Entity({ name: 'announcement' })
export class AnnouncementEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', name: 'name' })
  name: string;

  @Column({ type: 'text', name: 'description' })
  description: string;

  @Column({ type: 'enum', enum: AnnouncementStatus, name: 'status' })
  status: AnnouncementStatus;

  @Column({
    type: 'enum',
    enum: AnnouncementType,
    name: 'type',
    default: AnnouncementType.RECRUITMENT,
  })
  type: AnnouncementType;

  // How many volunteers the NGO is looking for; null = not specified
  @Column({ type: 'integer', name: 'volunteers_needed', nullable: true })
  volunteersNeeded: number;

  // Mobile shows the announcement only between these dates (end = open-ended when null)
  @Column({ type: 'timestamptz', name: 'display_start_date' })
  displayStartDate: Date;

  @Column({ type: 'timestamptz', name: 'display_end_date', nullable: true })
  displayEndDate: Date;

  // First time the announcement became active (volunteers are notified then)
  @Column({
    type: 'timestamptz',
    name: 'published_on',
    nullable: true,
  })
  publishedOn: Date;

  @Column({ type: 'timestamptz', name: 'archived_on', nullable: true })
  archivedOn: Date;

  @Column({ type: 'string', name: 'organization_id' })
  organizationId: string;

  @ManyToOne(() => OrganizationEntity)
  @JoinColumn({ name: 'organization_id' })
  organization: OrganizationEntity;

  // Active volunteers of the organization when the announcement was published
  @Column({ type: 'integer', name: 'targeted_volunteers', default: 0 })
  targetedVolunteers: number;
}
