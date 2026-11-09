import { BaseEntity } from 'src/infrastructure/base/base-entity';
import { RegularUserEntity } from 'src/modules/user/entities/user.entity';
import { VolunteerEntity } from 'src/modules/volunteer/entities/volunteer.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { AnnouncementEntity } from './announcement.entity';

// VIC 2.0 (#504): a volunteer's answer to an announcement, from the app; one per announcement
@Entity({ name: 'announcement_response' })
@Unique('UQ_announcement_response_user', ['announcementId', 'userId'])
export class AnnouncementResponseEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', name: 'comment' })
  comment: string;

  @Column({ type: 'uuid', name: 'announcement_id' })
  announcementId: string;

  @ManyToOne(() => AnnouncementEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'announcement_id' })
  announcement: AnnouncementEntity;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne(() => RegularUserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: RegularUserEntity;

  // the volunteer (in the announcement's organization) who answered
  @Column({ type: 'uuid', name: 'volunteer_id', nullable: true })
  volunteerId: string;

  @ManyToOne(() => VolunteerEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'volunteer_id' })
  volunteer: VolunteerEntity;
}
